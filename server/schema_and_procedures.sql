-- ==============================================================================
-- ENTERPRISE MNC SCHEMA, STORED PROCEDURES & SEED SCRIPT
-- Database: PostgreSQL
-- Pure SQL & PostgreSQL Stored Procedures (No ORM dependency)
-- ==============================================================================

-- Enable pgcrypto extension for enterprise-grade cryptographic password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 0. ADMIN USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    user_id       BIGINT GENERATED ALWAYS AS IDENTITY,
    email         VARCHAR(150)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)   NOT NULL,
    full_name     VARCHAR(100)   NOT NULL,
    role          VARCHAR(20)    NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'SUPERADMIN', 'STAFF')),
    is_active     BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_admin_users PRIMARY KEY (user_id)
);

CREATE INDEX IF NOT EXISTS ix_admin_users_email ON admin_users(LOWER(email));

-- -----------------------------------------------------------------------------
-- 1. ITEM MASTER
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS item_master (
    item_id     BIGINT GENERATED ALWAYS AS IDENTITY,
    item_code   VARCHAR(20)    NOT NULL UNIQUE,
    item_name   VARCHAR(100)   NOT NULL,
    uom         VARCHAR(10)    NOT NULL DEFAULT 'NOS',      -- unit of measure
    unit_price  NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_item_master PRIMARY KEY (item_id)
);

CREATE INDEX IF NOT EXISTS ix_item_master_code ON item_master(item_code);

-- -----------------------------------------------------------------------------
-- 2. CUSTOMER MASTER
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_master (
    customer_id    BIGINT GENERATED ALWAYS AS IDENTITY,
    customer_code  VARCHAR(20)   NOT NULL UNIQUE,
    customer_name  VARCHAR(150)  NOT NULL,
    phone          VARCHAR(20),
    email          VARCHAR(100),
    address        TEXT,
    is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_customer_master PRIMARY KEY (customer_id)
);

CREATE INDEX IF NOT EXISTS ix_customer_master_code ON customer_master(customer_code);

-- -----------------------------------------------------------------------------
-- 3. SALES HEADER (one row per sales order)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_header (
    sales_id      BIGINT GENERATED ALWAYS AS IDENTITY,
    sales_no      VARCHAR(20)    NOT NULL UNIQUE,
    sales_date    DATE           NOT NULL DEFAULT CURRENT_DATE,
    customer_id   BIGINT         NOT NULL,
    total_amount  NUMERIC(14,2)  NOT NULL DEFAULT 0,
    status        VARCHAR(15)    NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED')),
    remarks       VARCHAR(250),
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_sales_header PRIMARY KEY (sales_id),
    CONSTRAINT fk_sales_header_customer FOREIGN KEY (customer_id)
        REFERENCES customer_master(customer_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_sales_header_customer ON sales_header(customer_id);
CREATE INDEX IF NOT EXISTS ix_sales_header_no ON sales_header(sales_no);

-- -----------------------------------------------------------------------------
-- 4. SALES DETAILS (line items)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_details (
    sales_detail_id  BIGINT GENERATED ALWAYS AS IDENTITY,
    sales_id         BIGINT         NOT NULL,
    line_no          INT            NOT NULL,
    item_id          BIGINT         NOT NULL,
    quantity         NUMERIC(12,3)  NOT NULL CHECK (quantity > 0),
    unit_price       NUMERIC(12,2)  NOT NULL CHECK (unit_price >= 0),
    line_amount      NUMERIC(14,2)  GENERATED ALWAYS AS (quantity * unit_price) STORED,
    CONSTRAINT pk_sales_details PRIMARY KEY (sales_detail_id),
    CONSTRAINT fk_sales_details_header FOREIGN KEY (sales_id)
        REFERENCES sales_header(sales_id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_details_item FOREIGN KEY (item_id)
        REFERENCES item_master(item_id) ON DELETE RESTRICT,
    CONSTRAINT uq_sales_details_line UNIQUE (sales_id, line_no)
);

CREATE INDEX IF NOT EXISTS ix_sales_details_sales ON sales_details(sales_id);
CREATE INDEX IF NOT EXISTS ix_sales_details_item ON sales_details(item_id);

-- -----------------------------------------------------------------------------
-- 5. INVOICE (one invoice per sales order)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id       BIGINT GENERATED ALWAYS AS IDENTITY,
    invoice_no       VARCHAR(20)    NOT NULL UNIQUE,
    invoice_date     DATE           NOT NULL DEFAULT CURRENT_DATE,
    sales_id         BIGINT         NOT NULL UNIQUE,
    sub_total        NUMERIC(14,2)  NOT NULL DEFAULT 0,
    tax_amount       NUMERIC(14,2)  NOT NULL DEFAULT 0,
    net_amount       NUMERIC(14,2)  GENERATED ALWAYS AS (sub_total + tax_amount) STORED,
    payment_status   VARCHAR(10)    NOT NULL DEFAULT 'UNPAID'
                     CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_invoice PRIMARY KEY (invoice_id),
    CONSTRAINT fk_invoice_sales_header FOREIGN KEY (sales_id)
        REFERENCES sales_header(sales_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_invoice_sales ON invoice(sales_id);
CREATE INDEX IF NOT EXISTS ix_invoice_no ON invoice(invoice_no);


-- ==============================================================================
-- STORED PROCEDURES: ADMIN AUTHENTICATION
-- ==============================================================================

-- Authenticate Admin Procedure
CREATE OR REPLACE PROCEDURE sp_authenticate_admin(
    p_email VARCHAR,
    p_password VARCHAR,
    INOUT p_user_id BIGINT DEFAULT NULL,
    INOUT p_full_name VARCHAR DEFAULT NULL,
    INOUT p_role VARCHAR DEFAULT NULL,
    INOUT p_is_active BOOLEAN DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT user_id, full_name, role, is_active
    INTO p_user_id, p_full_name, p_role, p_is_active
    FROM admin_users
    WHERE LOWER(email) = LOWER(p_email)
      AND (
          password_hash = crypt(p_password, password_hash)
          OR password_hash = p_password
      );

    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid email or password.';
    END IF;

    IF p_is_active IS FALSE THEN
        RAISE EXCEPTION 'Admin account is deactivated.';
    END IF;
END;
$$;


-- ==============================================================================
-- STORED PROCEDURES: ITEM MASTER
-- ==============================================================================

-- 1. Insert Item
CREATE OR REPLACE PROCEDURE sp_insert_item(
    p_item_code VARCHAR,
    p_item_name VARCHAR,
    p_uom VARCHAR,
    p_unit_price NUMERIC,
    INOUT p_item_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM item_master WHERE item_code = p_item_code) THEN
        RAISE EXCEPTION 'Item with code ''%'' already exists.', p_item_code;
    END IF;

    INSERT INTO item_master (item_code, item_name, uom, unit_price, is_active)
    VALUES (p_item_code, p_item_name, COALESCE(p_uom, 'NOS'), COALESCE(p_unit_price, 0), TRUE)
    RETURNING item_id INTO p_item_id;
END;
$$;

-- 2. Update Item
CREATE OR REPLACE PROCEDURE sp_update_item(
    p_item_id BIGINT,
    p_item_code VARCHAR,
    p_item_name VARCHAR,
    p_uom VARCHAR,
    p_unit_price NUMERIC,
    p_is_active BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE item_master
    SET item_code = p_item_code,
        item_name = p_item_name,
        uom = COALESCE(p_uom, 'NOS'),
        unit_price = COALESCE(p_unit_price, 0),
        is_active = COALESCE(p_is_active, TRUE)
    WHERE item_id = p_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item with id % does not exist.', p_item_id;
    END IF;
END;
$$;

-- 3. Delete Item
CREATE OR REPLACE PROCEDURE sp_delete_item(
    p_item_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM sales_details WHERE item_id = p_item_id) THEN
        RAISE EXCEPTION 'Cannot delete item with id % because it is used in sales details.', p_item_id;
    END IF;

    DELETE FROM item_master WHERE item_id = p_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item with id % does not exist.', p_item_id;
    END IF;
END;
$$;

-- 4. Get All Items
CREATE OR REPLACE PROCEDURE sp_get_all_items(INOUT p_cursor REFCURSOR)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT item_id, item_code, item_name, uom, unit_price, is_active, created_at
        FROM item_master
        ORDER BY item_id DESC;
END;
$$;

-- 5. Get Item By ID
CREATE OR REPLACE PROCEDURE sp_get_item_by_id(
    p_item_id BIGINT,
    INOUT p_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT item_id, item_code, item_name, uom, unit_price, is_active, created_at
        FROM item_master
        WHERE item_id = p_item_id;
END;
$$;


-- ==============================================================================
-- STORED PROCEDURES: CUSTOMER MASTER
-- ==============================================================================

-- 1. Insert Customer
CREATE OR REPLACE PROCEDURE sp_insert_customer(
    p_customer_code VARCHAR,
    p_customer_name VARCHAR,
    p_phone VARCHAR,
    p_email VARCHAR,
    p_address TEXT,
    INOUT p_customer_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM customer_master WHERE customer_code = p_customer_code) THEN
        RAISE EXCEPTION 'Customer with code ''%'' already exists.', p_customer_code;
    END IF;

    INSERT INTO customer_master (customer_code, customer_name, phone, email, address, is_active)
    VALUES (p_customer_code, p_customer_name, p_phone, p_email, p_address, TRUE)
    RETURNING customer_id INTO p_customer_id;
END;
$$;

-- 2. Update Customer
CREATE OR REPLACE PROCEDURE sp_update_customer(
    p_customer_id BIGINT,
    p_customer_code VARCHAR,
    p_customer_name VARCHAR,
    p_phone VARCHAR,
    p_email VARCHAR,
    p_address TEXT,
    p_is_active BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE customer_master
    SET customer_code = p_customer_code,
        customer_name = p_customer_name,
        phone = p_phone,
        email = p_email,
        address = p_address,
        is_active = COALESCE(p_is_active, TRUE)
    WHERE customer_id = p_customer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer with id % does not exist.', p_customer_id;
    END IF;
END;
$$;

-- 3. Delete Customer
CREATE OR REPLACE PROCEDURE sp_delete_customer(
    p_customer_id BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM sales_header WHERE customer_id = p_customer_id) THEN
        RAISE EXCEPTION 'Cannot delete customer id % because sales orders exist for this customer.', p_customer_id;
    END IF;

    DELETE FROM customer_master WHERE customer_id = p_customer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer with id % does not exist.', p_customer_id;
    END IF;
END;
$$;

-- 4. Get All Customers
CREATE OR REPLACE PROCEDURE sp_get_all_customers(INOUT p_cursor REFCURSOR)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT customer_id, customer_code, customer_name, phone, email, address, is_active, created_at
        FROM customer_master
        ORDER BY customer_id DESC;
END;
$$;

-- 5. Get Customer By ID
CREATE OR REPLACE PROCEDURE sp_get_customer_by_id(
    p_customer_id BIGINT,
    INOUT p_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT customer_id, customer_code, customer_name, phone, email, address, is_active, created_at
        FROM customer_master
        WHERE customer_id = p_customer_id;
END;
$$;


-- ==============================================================================
-- STORED PROCEDURES: SALES ORDER & DETAILS
-- ==============================================================================

-- 1. Create Sales Order with Line Items (Atomic Transaction)
CREATE OR REPLACE PROCEDURE sp_create_sales_order(
    p_sales_no VARCHAR,
    p_sales_date DATE,
    p_customer_id BIGINT,
    p_status VARCHAR,
    p_remarks VARCHAR,
    p_lines JSONB,
    INOUT p_sales_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_line RECORD;
    v_line_no INT := 1;
    v_unit_price NUMERIC;
    v_item_price NUMERIC;
    v_total_amount NUMERIC := 0;
BEGIN
    -- Check if customer exists
    IF NOT EXISTS (SELECT 1 FROM customer_master WHERE customer_id = p_customer_id) THEN
        RAISE EXCEPTION 'Customer with id % does not exist.', p_customer_id;
    END IF;

    -- Check if sales_no exists
    IF EXISTS (SELECT 1 FROM sales_header WHERE sales_no = p_sales_no) THEN
        RAISE EXCEPTION 'Sales order with sales_no ''%'' already exists.', p_sales_no;
    END IF;

    -- Insert sales header
    INSERT INTO sales_header (sales_no, sales_date, customer_id, status, remarks, total_amount)
    VALUES (p_sales_no, COALESCE(p_sales_date, CURRENT_DATE), p_customer_id, COALESCE(p_status, 'DRAFT'), p_remarks, 0)
    RETURNING sales_id INTO p_sales_id;

    -- Insert line items
    FOR v_line IN SELECT * FROM jsonb_to_recordset(p_lines) AS x(item_id BIGINT, quantity NUMERIC, unit_price NUMERIC)
    LOOP
        -- Validate item exists and get price
        SELECT unit_price INTO v_item_price FROM item_master WHERE item_id = v_line.item_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Line %: Item with id % does not exist.', v_line_no, v_line.item_id;
        END IF;

        IF v_line.quantity IS NULL OR v_line.quantity <= 0 THEN
            RAISE EXCEPTION 'Line %: Quantity must be greater than 0.', v_line_no;
        END IF;

        v_unit_price := COALESCE(v_line.unit_price, v_item_price);

        INSERT INTO sales_details (sales_id, line_no, item_id, quantity, unit_price)
        VALUES (p_sales_id, v_line_no, v_line.item_id, v_line.quantity, v_unit_price);

        v_line_no := v_line_no + 1;
    END LOOP;

    -- Compute and update total amount
    SELECT COALESCE(SUM(line_amount), 0) INTO v_total_amount
    FROM sales_details
    WHERE sales_id = p_sales_id;

    UPDATE sales_header
    SET total_amount = v_total_amount
    WHERE sales_id = p_sales_id;
END;
$$;

-- 2. Get All Sales Orders
CREATE OR REPLACE PROCEDURE sp_get_all_sales_orders(INOUT p_cursor REFCURSOR)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT 
            sh.sales_id,
            sh.sales_no,
            sh.sales_date,
            sh.total_amount,
            sh.status,
            sh.remarks,
            sh.created_at,
            json_build_object(
                'customer_id', cm.customer_id,
                'customer_code', cm.customer_code,
                'customer_name', cm.customer_name,
                'phone', cm.phone,
                'email', cm.email,
                'address', cm.address
            ) AS customer_details,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'sales_detail_id', sd.sales_detail_id,
                            'line_no', sd.line_no,
                            'item_id', sd.item_id,
                            'quantity', sd.quantity,
                            'unit_price', sd.unit_price,
                            'line_amount', sd.line_amount,
                            'item_details', json_build_object(
                                'item_id', im.item_id,
                                'item_code', im.item_code,
                                'item_name', im.item_name,
                                'uom', im.uom,
                                'unit_price', im.unit_price
                            )
                        ) ORDER BY sd.line_no
                    )
                    FROM sales_details sd
                    JOIN item_master im ON im.item_id = sd.item_id
                    WHERE sd.sales_id = sh.sales_id
                ),
                '[]'::json
            ) AS lines,
            CASE WHEN inv.invoice_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_invoice,
            inv.invoice_no
        FROM sales_header sh
        JOIN customer_master cm ON cm.customer_id = sh.customer_id
        LEFT JOIN invoice inv ON inv.sales_id = sh.sales_id
        ORDER BY sh.sales_id DESC;
END;
$$;

-- 3. Get Sales Order By ID
CREATE OR REPLACE PROCEDURE sp_get_sales_order_by_id(
    p_sales_id BIGINT,
    INOUT p_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT 
            sh.sales_id,
            sh.sales_no,
            sh.sales_date,
            sh.total_amount,
            sh.status,
            sh.remarks,
            sh.created_at,
            json_build_object(
                'customer_id', cm.customer_id,
                'customer_code', cm.customer_code,
                'customer_name', cm.customer_name,
                'phone', cm.phone,
                'email', cm.email,
                'address', cm.address
            ) AS customer_details,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'sales_detail_id', sd.sales_detail_id,
                            'line_no', sd.line_no,
                            'item_id', sd.item_id,
                            'quantity', sd.quantity,
                            'unit_price', sd.unit_price,
                            'line_amount', sd.line_amount,
                            'item_details', json_build_object(
                                'item_id', im.item_id,
                                'item_code', im.item_code,
                                'item_name', im.item_name,
                                'uom', im.uom,
                                'unit_price', im.unit_price
                            )
                        ) ORDER BY sd.line_no
                    )
                    FROM sales_details sd
                    JOIN item_master im ON im.item_id = sd.item_id
                    WHERE sd.sales_id = sh.sales_id
                ),
                '[]'::json
            ) AS lines,
            CASE WHEN inv.invoice_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_invoice,
            inv.invoice_no
        FROM sales_header sh
        JOIN customer_master cm ON cm.customer_id = sh.customer_id
        LEFT JOIN invoice inv ON inv.sales_id = sh.sales_id
        WHERE sh.sales_id = p_sales_id;
END;
$$;

-- 4. Update Sales Order Status
CREATE OR REPLACE PROCEDURE sp_update_sales_status(
    p_sales_id BIGINT,
    p_status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE sales_header
    SET status = p_status
    WHERE sales_id = p_sales_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sales order with id % does not exist.', p_sales_id;
    END IF;
END;
$$;


-- ==============================================================================
-- STORED PROCEDURES: INVOICE
-- ==============================================================================

-- 1. Create Invoice from Sales Order Procedure
CREATE OR REPLACE PROCEDURE sp_create_invoice(
    p_sales_id BIGINT,
    p_invoice_no VARCHAR,
    p_invoice_date DATE,
    p_tax_rate NUMERIC DEFAULT 0.05,
    p_payment_status VARCHAR DEFAULT 'UNPAID',
    INOUT p_invoice_id BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_sub_total NUMERIC;
    v_tax_amount NUMERIC;
BEGIN
    SELECT total_amount INTO v_sub_total FROM sales_header WHERE sales_id = p_sales_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sales order with id % does not exist.', p_sales_id;
    END IF;

    IF EXISTS (SELECT 1 FROM invoice WHERE sales_id = p_sales_id) THEN
        RAISE EXCEPTION 'Invoice for sales order id % already exists.', p_sales_id;
    END IF;

    IF EXISTS (SELECT 1 FROM invoice WHERE invoice_no = p_invoice_no) THEN
        RAISE EXCEPTION 'Invoice with number ''%'' already exists.', p_invoice_no;
    END IF;

    v_tax_amount := ROUND(v_sub_total * COALESCE(p_tax_rate, 0.05), 2);

    INSERT INTO invoice (invoice_no, invoice_date, sales_id, sub_total, tax_amount, payment_status)
    VALUES (p_invoice_no, COALESCE(p_invoice_date, CURRENT_DATE), p_sales_id, v_sub_total, v_tax_amount, COALESCE(p_payment_status, 'UNPAID'))
    RETURNING invoice_id INTO p_invoice_id;

    UPDATE sales_header SET status = 'INVOICED' WHERE sales_id = p_sales_id;
END;
$$;

-- 2. Get All Invoices
CREATE OR REPLACE PROCEDURE sp_get_all_invoices(INOUT p_cursor REFCURSOR)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT 
            i.invoice_id,
            i.invoice_no,
            i.invoice_date,
            i.sales_id,
            i.sub_total,
            i.tax_amount,
            i.net_amount,
            i.payment_status,
            i.created_at,
            sh.sales_no,
            sh.sales_date,
            cm.customer_name,
            cm.customer_code
        FROM invoice i
        JOIN sales_header sh ON sh.sales_id = i.sales_id
        JOIN customer_master cm ON cm.customer_id = sh.customer_id
        ORDER BY i.invoice_id DESC;
END;
$$;

-- 3. Get Invoice By ID
CREATE OR REPLACE PROCEDURE sp_get_invoice_by_id(
    p_invoice_id BIGINT,
    INOUT p_cursor REFCURSOR
)
LANGUAGE plpgsql
AS $$
BEGIN
    OPEN p_cursor FOR
        SELECT 
            i.invoice_id,
            i.invoice_no,
            i.invoice_date,
            i.sales_id,
            i.sub_total,
            i.tax_amount,
            i.net_amount,
            i.payment_status,
            i.created_at,
            sh.sales_no,
            sh.sales_date,
            cm.customer_id,
            cm.customer_name,
            cm.customer_code,
            cm.phone,
            cm.email,
            cm.address
        FROM invoice i
        JOIN sales_header sh ON sh.sales_id = i.sales_id
        JOIN customer_master cm ON cm.customer_id = sh.customer_id
        WHERE i.invoice_id = p_invoice_id;
END;
$$;

-- 4. Update Invoice Payment Status
CREATE OR REPLACE PROCEDURE sp_update_invoice_payment_status(
    p_invoice_id BIGINT,
    p_payment_status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_payment_status NOT IN ('UNPAID', 'PARTIAL', 'PAID') THEN
        RAISE EXCEPTION 'Invalid payment status: %. Allowed: UNPAID, PARTIAL, PAID', p_payment_status;
    END IF;

    UPDATE invoice
    SET payment_status = p_payment_status
    WHERE invoice_id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice with id % does not exist.', p_invoice_id;
    END IF;
END;
$$;


-- ==============================================================================
-- 3 ADMIN USERS SEED TEMPLATE (SQL)
-- ==============================================================================
-- EDIT THESE 3 ADMIN USERS WITH YOUR EMAIL AND PASSWORD BEFORE RUNNING:
-- The crypt() function hashes the password using standard bcrypt (Blowfish).
-- ==============================================================================

INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES
    -- Admin 1: Superadmin (Primary Admin)
    (
        'admin1@company.com', 
        crypt('AdminPass123!', gen_salt('bf', 8)), 
        'Primary Superadmin', 
        'SUPERADMIN', 
        TRUE
    ),

    -- Admin 2: Operations Admin
    (
        'admin2@company.com', 
        crypt('AdminPass123!', gen_salt('bf', 8)), 
        'Operations Administrator', 
        'ADMIN', 
        TRUE
    ),

    -- Admin 3: Finance Admin
    (
        'admin3@company.com', 
        crypt('AdminPass123!', gen_salt('bf', 8)), 
        'Finance Administrator', 
        'ADMIN', 
        TRUE
    )
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- ==============================================================================
-- END OF SCHEMA & PROCEDURES
-- ==============================================================================
