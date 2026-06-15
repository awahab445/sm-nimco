--
-- PostgreSQL database dump
--

\restrict usEvP7wuccpT0bO7I6l5zxYcTxhWMapsaC45twdggbmVxFGC8NvgnkV8WWQu3BZ

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: account_creation_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_creation_tokens (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.account_creation_tokens OWNER TO postgres;

--
-- Name: admin_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_permissions (
    id uuid NOT NULL,
    key character varying(120) NOT NULL,
    description character varying(500),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_permissions OWNER TO postgres;

--
-- Name: admin_role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.admin_role_permissions OWNER TO postgres;

--
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_roles (
    id uuid NOT NULL,
    slug character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.admin_roles OWNER TO postgres;

--
-- Name: admin_user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


ALTER TABLE public.admin_user_roles OWNER TO postgres;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    parent_id text,
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: cms_banner_sliders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_banner_sliders (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    identifier character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    autoplay_ms integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    slide_height_px integer,
    slide_width_px integer
);


ALTER TABLE public.cms_banner_sliders OWNER TO postgres;

--
-- Name: cms_banner_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_banner_slides (
    id text NOT NULL,
    slider_id text NOT NULL,
    title character varying(255) NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    cta_label character varying(120),
    cta_href character varying(500),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cms_banner_slides OWNER TO postgres;

--
-- Name: cms_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_blocks (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    identifier character varying(255) NOT NULL,
    description text,
    content_html text,
    content_json jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cms_blocks OWNER TO postgres;

--
-- Name: cms_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_pages (
    id text NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    excerpt text,
    meta_title character varying(255),
    meta_description text,
    content_html text,
    content_json jsonb DEFAULT '{}'::jsonb,
    published_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cms_pages OWNER TO postgres;

--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_addresses (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    label character varying(100),
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    company character varying(255),
    address_line1 character varying(500) NOT NULL,
    address_line2 character varying(500),
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    postal_code character varying(50) NOT NULL,
    country character varying(2) NOT NULL,
    phone character varying(50),
    is_default_billing boolean DEFAULT false NOT NULL,
    is_default_shipping boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customer_addresses OWNER TO postgres;

--
-- Name: customer_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_groups (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false NOT NULL,
    tax_class_id uuid,
    discount_percent numeric(5,2),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customer_groups OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(50),
    is_guest boolean DEFAULT false NOT NULL,
    customer_group_id uuid NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id text NOT NULL,
    product_id text,
    variant_id text,
    warehouse_id text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    available_quantity integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 10 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: inventory_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_reservations (
    id text NOT NULL,
    inventory_item_id text NOT NULL,
    reference_type text NOT NULL,
    reference_id text NOT NULL,
    quantity integer NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_reservations OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    sku character varying(100) NOT NULL,
    name character varying(500) NOT NULL,
    attributes jsonb DEFAULT '{}'::jsonb NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    row_total numeric(12,2) NOT NULL,
    quantity_fulfilled integer DEFAULT 0 NOT NULL,
    quantity_refunded integer DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_shipping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping (
    id text NOT NULL,
    order_id text NOT NULL,
    shipping_method_id text NOT NULL,
    cost numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    tracking_number character varying(255),
    tracking_url text,
    courier_code character varying(50),
    courier_name character varying(255),
    shipped_at timestamp(3) without time zone,
    delivered_at timestamp(3) without time zone,
    cancelled_at timestamp(3) without time zone,
    shipping_address jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_shipping OWNER TO postgres;

--
-- Name: order_taxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_taxes (
    id text NOT NULL,
    order_id text NOT NULL,
    tax_id text NOT NULL,
    tax_class_id text NOT NULL,
    tax_class_code character varying(50) NOT NULL,
    tax_class_name character varying(255) NOT NULL,
    country character varying(2) NOT NULL,
    region character varying(100),
    rate numeric(5,4) NOT NULL,
    is_inclusive boolean NOT NULL,
    taxable_amount numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_taxes OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    order_number character varying(50) NOT NULL,
    customer_id uuid,
    customer_group_id uuid,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    fulfillment_status character varying(50) DEFAULT 'unfulfilled'::character varying,
    customer_email character varying(255) NOT NULL,
    customer_name character varying(255),
    billing_address jsonb NOT NULL,
    shipping_address jsonb NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    discount_total numeric(12,2) DEFAULT 0 NOT NULL,
    shipping_total numeric(12,2) DEFAULT 0 NOT NULL,
    tax_total numeric(12,2) DEFAULT 0 NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    applied_price_rules jsonb DEFAULT '[]'::jsonb NOT NULL,
    ip_address inet,
    user_agent text,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    cancelled_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id text NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    provider character varying(50) NOT NULL,
    flow_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    order_id text NOT NULL,
    payment_method_id text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    flow_type character varying(50) NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    gateway_transaction_id character varying(255),
    client_secret text,
    redirect_url text,
    gateway_response jsonb DEFAULT '{}'::jsonb,
    captured_at timestamp(3) without time zone,
    failed_at timestamp(3) without time zone,
    refunded_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    product_id text NOT NULL,
    category_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    url text NOT NULL,
    alt_text text,
    "position" integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_option_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option_values (
    id text NOT NULL,
    option_id text NOT NULL,
    value text NOT NULL,
    code character varying(120),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_option_values OWNER TO postgres;

--
-- Name: product_option_values_on_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option_values_on_products (
    product_id text NOT NULL,
    option_id text NOT NULL,
    value_id text NOT NULL
);


ALTER TABLE public.product_option_values_on_products OWNER TO postgres;

--
-- Name: product_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_options (
    id text NOT NULL,
    name text NOT NULL,
    code character varying(120) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_options OWNER TO postgres;

--
-- Name: product_options_on_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_options_on_products (
    product_id text NOT NULL,
    option_id text NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_options_on_products OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    product_id text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    weight numeric(10,2),
    attributes jsonb DEFAULT '{}'::jsonb,
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type text NOT NULL,
    description text,
    short_description text,
    base_price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    weight numeric(10,2),
    status text DEFAULT 'draft'::text NOT NULL,
    visibility text DEFAULT 'both'::text NOT NULL,
    tax_class_id text,
    attributes jsonb DEFAULT '{}'::jsonb,
    meta_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: promotion_customer_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_customer_groups (
    id text NOT NULL,
    promotion_id text NOT NULL,
    customer_group_id uuid NOT NULL,
    is_excluded boolean DEFAULT false NOT NULL
);


ALTER TABLE public.promotion_customer_groups OWNER TO postgres;

--
-- Name: promotion_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_logs (
    id text NOT NULL,
    promotion_id text NOT NULL,
    cart_id text,
    checkout_id text,
    order_id text,
    customer_id text,
    coupon_code character varying(100),
    discount_amount numeric(12,2) NOT NULL,
    subtotal_before numeric(12,2) NOT NULL,
    subtotal_after numeric(12,2) NOT NULL,
    status character varying(50) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.promotion_logs OWNER TO postgres;

--
-- Name: promotion_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_products (
    id text NOT NULL,
    promotion_id text NOT NULL,
    product_id text,
    variant_id text,
    category_id text
);


ALTER TABLE public.promotion_products OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id text NOT NULL,
    code character varying(100),
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    discount_value numeric(10,2),
    discount_type character varying(50) NOT NULL,
    scope character varying(50) DEFAULT 'cart'::character varying NOT NULL,
    is_stackable boolean DEFAULT false NOT NULL,
    is_exclusive boolean DEFAULT true NOT NULL,
    applies_to_all_groups boolean DEFAULT false NOT NULL,
    conditions jsonb DEFAULT '{}'::jsonb NOT NULL,
    usage_limit integer,
    usage_limit_per_user integer,
    current_usage integer DEFAULT 0 NOT NULL,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: shipping_method_customer_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_method_customer_groups (
    id text NOT NULL,
    shipping_method_id text NOT NULL,
    customer_group_id uuid NOT NULL,
    discount_percent numeric(5,2),
    fixed_cost numeric(12,2),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_method_customer_groups OWNER TO postgres;

--
-- Name: shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_methods (
    id text NOT NULL,
    zone_id text NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    min_order_amount numeric(12,2),
    max_order_amount numeric(12,2),
    min_weight numeric(10,2),
    max_weight numeric(10,2),
    priority integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    courier_config jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_methods OWNER TO postgres;

--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_zones (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    coverage jsonb DEFAULT '{}'::jsonb NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_zones OWNER TO postgres;

--
-- Name: storefront_filter_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storefront_filter_options (
    id uuid NOT NULL,
    filter_id uuid NOT NULL,
    value character varying(255) NOT NULL,
    label character varying(255),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.storefront_filter_options OWNER TO postgres;

--
-- Name: storefront_filter_tree_nodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storefront_filter_tree_nodes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filter_id uuid NOT NULL,
    parent_id uuid,
    nav_link_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.storefront_filter_tree_nodes OWNER TO postgres;

--
-- Name: storefront_filters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storefront_filters (
    id uuid NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    kind character varying(32) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.storefront_filters OWNER TO postgres;

--
-- Name: storefront_nav_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storefront_nav_links (
    id uuid NOT NULL,
    label character varying(128) NOT NULL,
    secondary_label character varying(128),
    href character varying(512) DEFAULT ''::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    kind character varying(32) DEFAULT 'LINK'::character varying NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    zone character varying(16) DEFAULT 'header'::character varying NOT NULL,
    parent_id uuid,
    category_id text,
    open_mega_menu boolean DEFAULT false NOT NULL,
    banner_image_url character varying(512),
    banner_href character varying(512),
    banner_alt character varying(256)
);


ALTER TABLE public.storefront_nav_links OWNER TO postgres;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    source character varying(100),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- Name: tax_classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_classes (
    id text NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tax_classes OWNER TO postgres;

--
-- Name: taxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taxes (
    id text NOT NULL,
    tax_class_id text NOT NULL,
    country character varying(2) NOT NULL,
    region character varying(100),
    rate numeric(5,4) NOT NULL,
    is_inclusive boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.taxes OWNER TO postgres;

--
-- Name: variant_option_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variant_option_values (
    variant_id text NOT NULL,
    option_id text NOT NULL,
    value_id text NOT NULL
);


ALTER TABLE public.variant_option_values OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2f5e8ab8-8df8-42ca-ac94-dfd319a32b57	561b2137465cd34c6501660d21ced3ea26bd3f77bf009360ed6db53318bead96	\N	20250308000000_add_customer_password_hash	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250308000000_add_customer_password_hash\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "customers" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"customers\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(639), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250308000000_add_customer_password_hash"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250308000000_add_customer_password_hash"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260	\N	2026-05-04 11:22:21.031256+05	0
\.


--
-- Data for Name: account_creation_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_creation_tokens (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions (id, key, description, created_at) FROM stdin;
6a942717-6026-44e7-80e7-26858f8c3eb5	payments.manage	Manage payment configuration	2026-05-11 11:57:44.154
a629f498-ffea-40d3-b191-bb736eb424cf	cms.manage	Manage CMS pages, blocks, and sliders	2026-05-06 11:10:43.51
664eb436-11ef-46e0-975d-9b30e7f6a127	subscriptions.manage	View storefront email subscriptions (subscriber list)	2026-05-12 07:40:14.805
ccaa881a-2690-41ec-aec9-c061f97c9b7d	reports.read	Access reports and exports	2026-05-04 07:22:01.072
29f643ad-529b-4b68-9932-1828b89c8fa1	settings.manage	Platform settings	2026-05-04 07:22:01.074
107a5e7f-39d7-4f91-8d6e-c68a866de6c8	admin.access.full	Full administrative access (implies all permissions).	2026-05-04 07:22:01.029
79710646-175d-4aae-bdd1-ba9bc8d2844f	admin.users.create	Create staff admin users	2026-05-04 07:22:01.042
5bc3fe92-08d5-4857-b05b-c1b912418a6b	admin.users.read	View admin users	2026-05-04 07:22:01.043
43ed1a83-e047-4c39-a3d5-effae8fa2470	admin.users.update	Update admin users	2026-05-04 07:22:01.044
0ca45dcb-baa7-4d64-89fe-da7e0d3e0387	admin.users.delete	Deactivate or remove admin users	2026-05-04 07:22:01.045
bd93314d-9f7e-4048-b578-e518247f01b0	admin.roles.read	View roles and permission assignments	2026-05-04 07:22:01.047
05e177b9-9c57-40a1-92c5-fe6e61dde134	admin.roles.manage	Create or update roles and permissions	2026-05-04 07:22:01.049
d8693266-66d8-4df3-964f-3b3c854155b9	products.create	Create products	2026-05-11 11:57:44.123
e0e19340-ce43-46a4-b5b7-fb8622c2fdcd	products.read	Read products	2026-05-11 11:57:44.048
cf811019-a242-4070-851b-3fbb11e88898	products.update	Update products and their sub-resources (variants, images, categories)	2026-05-11 11:57:44.126
669ddf50-cf30-4822-8de0-96a7b2192a72	products.delete	Delete products	2026-05-11 11:57:44.127
578c6923-b261-4247-ab41-a11f61e98b6a	orders.create	Create orders (admin-side)	2026-05-11 11:57:44.129
2c5b5e04-816b-4864-bf47-d7eff12f79d4	orders.read	Read orders	2026-05-04 07:22:01.059
85e0875b-36cf-41ae-ac81-bab9cf0a5b14	orders.update	Update orders, status, fulfillment	2026-05-11 11:57:44.133
7b44e006-b5f3-4800-94f8-c068828c2f2b	orders.delete	Delete orders	2026-05-11 11:57:44.134
269ae629-3064-4e6d-8bd8-2fb2d7d8814d	customers.create	Create customers	2026-05-11 11:57:44.136
ea11fbc5-c6c8-43c6-b013-66cebc87beba	customers.read	Read customers	2026-05-04 07:22:01.062
b6151fdf-2507-4841-a50e-24668be1ea79	customers.update	Update customers	2026-05-11 11:57:44.139
1d702124-962e-4d24-9a83-cbfb33b21b93	customers.delete	Delete customers	2026-05-11 11:57:44.141
0adebdc6-0b0d-4dda-b217-5de5f3b5ed26	products.manage	Manage products, categories, and product options (implies all products.* actions)	2026-05-11 11:57:44.1
4ade7771-a344-4bcb-a7ee-4f079430104e	inventory.read	Read inventory	2026-05-04 07:22:01.056
7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583	inventory.manage	Manage inventory and stock	2026-05-04 07:22:01.057
1dcba78f-a3d7-496f-a2ba-ed6585be6b73	orders.manage	Manage orders (implies all orders.* actions)	2026-05-04 07:22:01.06
51062b59-ddd6-4ff8-ac4e-2f70f4cde409	customers.manage	Manage customers and groups (implies all customers.* actions)	2026-05-04 07:22:01.063
8332b6b7-13cb-472f-a4b0-73cc50eea78e	promotions.manage	Manage promotions	2026-05-04 07:22:01.064
55afa5c3-5076-4a94-a014-fa92c5fddb01	shipping.manage	Manage shipping zones and methods	2026-05-04 07:22:01.065
1c9d2a05-1853-4ace-bc60-e4156437384b	tax.manage	Manage tax classes and rates	2026-05-04 07:22:01.069
\.


--
-- Data for Name: admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_role_permissions (role_id, permission_id) FROM stdin;
5dc16cb3-f12c-4195-9c85-90563c17d927	7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583
36d65b9f-5927-487b-be37-943b03c16541	d8693266-66d8-4df3-964f-3b3c854155b9
36d65b9f-5927-487b-be37-943b03c16541	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
36d65b9f-5927-487b-be37-943b03c16541	cf811019-a242-4070-851b-3fbb11e88898
36d65b9f-5927-487b-be37-943b03c16541	669ddf50-cf30-4822-8de0-96a7b2192a72
36d65b9f-5927-487b-be37-943b03c16541	0adebdc6-0b0d-4dda-b217-5de5f3b5ed26
926550ee-84bb-414a-99f6-e11673f3da0e	6a942717-6026-44e7-80e7-26858f8c3eb5
926550ee-84bb-414a-99f6-e11673f3da0e	a629f498-ffea-40d3-b191-bb736eb424cf
926550ee-84bb-414a-99f6-e11673f3da0e	664eb436-11ef-46e0-975d-9b30e7f6a127
926550ee-84bb-414a-99f6-e11673f3da0e	ccaa881a-2690-41ec-aec9-c061f97c9b7d
926550ee-84bb-414a-99f6-e11673f3da0e	29f643ad-529b-4b68-9932-1828b89c8fa1
926550ee-84bb-414a-99f6-e11673f3da0e	107a5e7f-39d7-4f91-8d6e-c68a866de6c8
926550ee-84bb-414a-99f6-e11673f3da0e	79710646-175d-4aae-bdd1-ba9bc8d2844f
926550ee-84bb-414a-99f6-e11673f3da0e	5bc3fe92-08d5-4857-b05b-c1b912418a6b
926550ee-84bb-414a-99f6-e11673f3da0e	43ed1a83-e047-4c39-a3d5-effae8fa2470
926550ee-84bb-414a-99f6-e11673f3da0e	0ca45dcb-baa7-4d64-89fe-da7e0d3e0387
926550ee-84bb-414a-99f6-e11673f3da0e	bd93314d-9f7e-4048-b578-e518247f01b0
926550ee-84bb-414a-99f6-e11673f3da0e	05e177b9-9c57-40a1-92c5-fe6e61dde134
926550ee-84bb-414a-99f6-e11673f3da0e	d8693266-66d8-4df3-964f-3b3c854155b9
926550ee-84bb-414a-99f6-e11673f3da0e	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
926550ee-84bb-414a-99f6-e11673f3da0e	cf811019-a242-4070-851b-3fbb11e88898
926550ee-84bb-414a-99f6-e11673f3da0e	669ddf50-cf30-4822-8de0-96a7b2192a72
926550ee-84bb-414a-99f6-e11673f3da0e	578c6923-b261-4247-ab41-a11f61e98b6a
926550ee-84bb-414a-99f6-e11673f3da0e	2c5b5e04-816b-4864-bf47-d7eff12f79d4
926550ee-84bb-414a-99f6-e11673f3da0e	85e0875b-36cf-41ae-ac81-bab9cf0a5b14
926550ee-84bb-414a-99f6-e11673f3da0e	7b44e006-b5f3-4800-94f8-c068828c2f2b
926550ee-84bb-414a-99f6-e11673f3da0e	269ae629-3064-4e6d-8bd8-2fb2d7d8814d
926550ee-84bb-414a-99f6-e11673f3da0e	ea11fbc5-c6c8-43c6-b013-66cebc87beba
926550ee-84bb-414a-99f6-e11673f3da0e	b6151fdf-2507-4841-a50e-24668be1ea79
926550ee-84bb-414a-99f6-e11673f3da0e	1d702124-962e-4d24-9a83-cbfb33b21b93
926550ee-84bb-414a-99f6-e11673f3da0e	0adebdc6-0b0d-4dda-b217-5de5f3b5ed26
926550ee-84bb-414a-99f6-e11673f3da0e	4ade7771-a344-4bcb-a7ee-4f079430104e
926550ee-84bb-414a-99f6-e11673f3da0e	7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583
926550ee-84bb-414a-99f6-e11673f3da0e	1dcba78f-a3d7-496f-a2ba-ed6585be6b73
926550ee-84bb-414a-99f6-e11673f3da0e	51062b59-ddd6-4ff8-ac4e-2f70f4cde409
926550ee-84bb-414a-99f6-e11673f3da0e	8332b6b7-13cb-472f-a4b0-73cc50eea78e
926550ee-84bb-414a-99f6-e11673f3da0e	55afa5c3-5076-4a94-a014-fa92c5fddb01
926550ee-84bb-414a-99f6-e11673f3da0e	1c9d2a05-1853-4ace-bc60-e4156437384b
e4d44e14-47e2-4632-8c43-1ee84cd85eca	6a942717-6026-44e7-80e7-26858f8c3eb5
e4d44e14-47e2-4632-8c43-1ee84cd85eca	a629f498-ffea-40d3-b191-bb736eb424cf
e4d44e14-47e2-4632-8c43-1ee84cd85eca	664eb436-11ef-46e0-975d-9b30e7f6a127
e4d44e14-47e2-4632-8c43-1ee84cd85eca	ccaa881a-2690-41ec-aec9-c061f97c9b7d
e4d44e14-47e2-4632-8c43-1ee84cd85eca	5bc3fe92-08d5-4857-b05b-c1b912418a6b
e4d44e14-47e2-4632-8c43-1ee84cd85eca	bd93314d-9f7e-4048-b578-e518247f01b0
e4d44e14-47e2-4632-8c43-1ee84cd85eca	d8693266-66d8-4df3-964f-3b3c854155b9
e4d44e14-47e2-4632-8c43-1ee84cd85eca	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
e4d44e14-47e2-4632-8c43-1ee84cd85eca	cf811019-a242-4070-851b-3fbb11e88898
e4d44e14-47e2-4632-8c43-1ee84cd85eca	669ddf50-cf30-4822-8de0-96a7b2192a72
e4d44e14-47e2-4632-8c43-1ee84cd85eca	578c6923-b261-4247-ab41-a11f61e98b6a
e4d44e14-47e2-4632-8c43-1ee84cd85eca	2c5b5e04-816b-4864-bf47-d7eff12f79d4
e4d44e14-47e2-4632-8c43-1ee84cd85eca	85e0875b-36cf-41ae-ac81-bab9cf0a5b14
e4d44e14-47e2-4632-8c43-1ee84cd85eca	7b44e006-b5f3-4800-94f8-c068828c2f2b
e4d44e14-47e2-4632-8c43-1ee84cd85eca	269ae629-3064-4e6d-8bd8-2fb2d7d8814d
e4d44e14-47e2-4632-8c43-1ee84cd85eca	ea11fbc5-c6c8-43c6-b013-66cebc87beba
e4d44e14-47e2-4632-8c43-1ee84cd85eca	b6151fdf-2507-4841-a50e-24668be1ea79
e4d44e14-47e2-4632-8c43-1ee84cd85eca	1d702124-962e-4d24-9a83-cbfb33b21b93
e4d44e14-47e2-4632-8c43-1ee84cd85eca	0adebdc6-0b0d-4dda-b217-5de5f3b5ed26
e4d44e14-47e2-4632-8c43-1ee84cd85eca	4ade7771-a344-4bcb-a7ee-4f079430104e
e4d44e14-47e2-4632-8c43-1ee84cd85eca	7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583
e4d44e14-47e2-4632-8c43-1ee84cd85eca	1dcba78f-a3d7-496f-a2ba-ed6585be6b73
e4d44e14-47e2-4632-8c43-1ee84cd85eca	51062b59-ddd6-4ff8-ac4e-2f70f4cde409
e4d44e14-47e2-4632-8c43-1ee84cd85eca	8332b6b7-13cb-472f-a4b0-73cc50eea78e
e4d44e14-47e2-4632-8c43-1ee84cd85eca	55afa5c3-5076-4a94-a014-fa92c5fddb01
e4d44e14-47e2-4632-8c43-1ee84cd85eca	1c9d2a05-1853-4ace-bc60-e4156437384b
f72b62cb-1ae0-4ba2-b178-12539e326c14	ccaa881a-2690-41ec-aec9-c061f97c9b7d
f72b62cb-1ae0-4ba2-b178-12539e326c14	bd93314d-9f7e-4048-b578-e518247f01b0
f72b62cb-1ae0-4ba2-b178-12539e326c14	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
f72b62cb-1ae0-4ba2-b178-12539e326c14	2c5b5e04-816b-4864-bf47-d7eff12f79d4
f72b62cb-1ae0-4ba2-b178-12539e326c14	ea11fbc5-c6c8-43c6-b013-66cebc87beba
f72b62cb-1ae0-4ba2-b178-12539e326c14	4ade7771-a344-4bcb-a7ee-4f079430104e
\.


--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_roles (id, slug, name, description, is_system, created_at, updated_at) FROM stdin;
5dc16cb3-f12c-4195-9c85-90563c17d927	inventory-management	inventory management	update & manage inventory	f	2026-05-11 09:40:56.034	2026-05-11 09:40:56.034
36d65b9f-5927-487b-be37-943b03c16541	products-management	products management	update and manage all products	f	2026-05-11 12:02:41.329	2026-05-11 12:02:41.329
926550ee-84bb-414a-99f6-e11673f3da0e	super-admin	Super Admin	Full platform access. Assign sparingly.	t	2026-05-04 07:22:01.076	2026-05-14 13:39:16.329
e4d44e14-47e2-4632-8c43-1ee84cd85eca	manager	Operations Manager	Day-to-day commerce operations without user/role administration.	t	2026-05-12 07:03:29.765	2026-05-14 13:39:16.331
f72b62cb-1ae0-4ba2-b178-12539e326c14	support	Support	Read-heavy access for customer service.	t	2026-05-12 07:03:29.768	2026-05-14 13:39:16.333
\.


--
-- Data for Name: admin_user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_user_roles (user_id, role_id) FROM stdin;
f4b18155-4045-41e5-8bfc-c9371013bbd3	926550ee-84bb-414a-99f6-e11673f3da0e
20dd43d6-e741-4256-bf8d-8fef76fb7c47	926550ee-84bb-414a-99f6-e11673f3da0e
f2579ef9-ed54-4bcc-a685-61f049bf38a0	5dc16cb3-f12c-4195-9c85-90563c17d927
1988f799-1a91-49d9-8322-36d857c54915	36d65b9f-5927-487b-be37-943b03c16541
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, password_hash, first_name, last_name, is_active, last_login_at, created_at, updated_at) FROM stdin;
20dd43d6-e741-4256-bf8d-8fef76fb7c47	a.wahab445@gmail.com	$2b$10$aYlaY6PZ6o.AKWYdUr775uZW9A0bfkp0mka65ej/BomKZsZmLkwei	abdul	wahab	t	2026-05-11 14:39:50.892+05	2026-05-11 09:21:52.545	2026-05-11 09:39:50.893
1988f799-1a91-49d9-8322-36d857c54915	products@admin.com	$2b$10$VNC/Tyfa5JH/FI7DcGmwou5P0HlaXmZ3KA0T9dnAf8rQqhpeOdl3y	products	management	t	2026-05-11 17:03:42.621+05	2026-05-11 12:03:18.182	2026-05-11 12:03:42.624
f2579ef9-ed54-4bcc-a685-61f049bf38a0	dummy@admin.com	$2b$10$I6FYLJt9Vs/JS0nK4iSX6eSV2UY5jpweG1kkFuWqxRoAy..ij18My	inventory	manager	t	2026-05-12 10:53:22.532+05	2026-05-11 09:41:54.067	2026-05-12 05:53:22.533
f4b18155-4045-41e5-8bfc-c9371013bbd3	huzaifa@admin.com	$2b$10$b9eBNs4skCrh/Fy/70wta.64I6Z1w60vXENXBSnCf2qNEACEuoG2u	Super	Admin	t	2026-05-13 18:37:05.259+05	2026-05-04 07:22:01.201	2026-05-13 13:37:05.274
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, parent_id, "position", is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cms_banner_sliders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_sliders (id, name, identifier, is_active, autoplay_ms, created_at, updated_at, slide_height_px, slide_width_px) FROM stdin;
1bf78196-8e5c-416b-b0f4-e70a8396b3f4	Home Hero Slider	home-hero	t	5000	2026-05-06 11:10:43.589	2026-05-14 09:07:13.805	800	1885
\.


--
-- Data for Name: cms_banner_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_slides (id, slider_id, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active, created_at, updated_at) FROM stdin;
9c40ac54-e719-445e-a0c6-65135e30f02c	1bf78196-8e5c-416b-b0f4-e70a8396b3f4	Shop smarter with confidence	Curated essentials at fair prices.	/themes/mehfil-shereen/banner1.jpeg	Shop now	/products	0	t	2026-05-14 09:07:13.805	2026-05-14 09:07:13.805
84f64450-3535-4380-ad79-680cdbd5e36d	1bf78196-8e5c-416b-b0f4-e70a8396b3f4	Track your orders anytime	Real-time updates from checkout to delivery.	/themes/mehfil-shereen/banner2.jpeg	Track order	/track-order	1	t	2026-05-14 09:07:13.805	2026-05-14 09:07:13.805
\.


--
-- Data for Name: cms_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_blocks (id, name, identifier, description, content_html, content_json, is_active, created_at, updated_at) FROM stdin;
5fd1a7da-ae28-4ea8-abeb-b3cbfca36dc3	Home Page Layout	home-page-layout	Structured sections consumed by storefront homepage	<p>Home page layout JSON block.</p>	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "Members save more", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "Create your account for exclusive offers."}, {"id": "inline-teaser", "type": "cms_block_ref", "blockIdentifier": "home-inline-teaser"}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}]}	t	2026-05-06 11:10:43.581	2026-05-12 13:16:46.739
f0a06619-77d8-4341-be1c-5264e7b2114d	Home page lay out1	home-page-layout1	test run	Home page layout JSON block.	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "test run ", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "blocks test run."}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}]}	t	2026-05-09 11:00:52.585	2026-05-09 11:13:53.205
b1666ef1-3569-4837-bcc7-60da6b3e5aca	Home inline teaser	home-inline-teaser	Example block embedded in homepage layout by identifier	<div class="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"><h2 class="text-lg font-semibold text-foreground">Managed as its own block</h2><p class="mt-2 text-sm text-muted-foreground">This copy lives in the <strong>home-inline-teaser</strong> CMS block. The home layout references it by identifier so you can edit it separately from the layout JSON.</p></div>	{}	t	2026-05-09 15:06:31.808	2026-05-12 13:16:46.735
\.


--
-- Data for Name: cms_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_pages (id, title, slug, status, excerpt, meta_title, meta_description, content_html, content_json, published_at, created_at, updated_at) FROM stdin;
55e2338a-d4d9-4dd9-96dd-f2c9a3d28fd8	Feedback	feed-back	published	give us your feedback	feedback	give us your feedback	<span style="color: rgb(0, 0, 0); font-family: ui-sans-serif, system-ui, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;; font-size: 16px; background-color: rgb(250, 250, 249);"><b><i>We value your feedback and are committed to providing the best service possible.</i></b></span>	{}	2026-05-09 12:47:30.291	2026-05-09 12:46:43.074	2026-05-09 12:47:30.292
91a59ded-c6f8-48ad-8ad7-4710ce375b97	About Us	about-us	published	Learn more about our mission and team.	About Us	About our ecommerce store and what we stand for.	<h1>About Us</h1><p>We are building a modern ecommerce experience with trusted products and reliable delivery.</p><p>Our mission is simple: quality, transparency, and customer-first service.</p>	{}	2026-05-12 13:16:46.706	2026-05-06 11:10:43.576	2026-05-12 13:16:46.718
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_addresses (id, customer_id, label, first_name, last_name, company, address_line1, address_line2, city, state, postal_code, country, phone, is_default_billing, is_default_shipping, created_at, updated_at) FROM stdin;
af19751a-b0d7-4e71-9bbe-5c134bc191a2	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	HOME A	SYED	HUZAIFA		SAEEDABAD		KARACHI	SINDH	74760	PK		t	t	2026-05-04 07:06:40.368	2026-05-04 07:06:43.125
\.


--
-- Data for Name: customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_groups (id, name, description, is_default, tax_class_id, discount_percent, metadata, created_at, updated_at) FROM stdin;
8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	default	Default customers	t	\N	10.00	{}	2026-05-04 06:53:26.01	2026-05-04 06:57:43.567
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, email, password_hash, first_name, last_name, phone, is_guest, customer_group_id, metadata, created_at, updated_at) FROM stdin;
88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	smhuzaifa525@gmail.com	$2b$10$Qde.kZ1dhoEE94b1cyjOPeDnGBxGdbHiFKCWR1CD0WgRPLbi55N.u	syed	huzaifa	+92 332 2272592	f	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-05-04 06:58:33.211	2026-05-04 06:58:33.211
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, product_id, variant_id, warehouse_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, updated_at) FROM stdin;
a1afebad-765e-4e6d-b999-aa4449d7548f	64289463-e48b-4261-bfef-e59b622eb20e	2c9efd53-dfc4-48f6-9a5c-9a16df162132	default-warehouse	0	0	0	10	2026-05-08 07:09:31.476
70f7e198-17bb-4449-855f-f3a2be94da08	64289463-e48b-4261-bfef-e59b622eb20e	13293c57-d881-4a28-b7b6-d16d5054ac55	default-warehouse	0	0	0	10	2026-05-08 07:09:31.476
d9d76782-cbfc-42e9-932a-e2d102a1a02e	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	default-warehouse	100	0	100	10	2026-05-04 07:01:30.851
1d62551d-4147-4618-b49d-c956c15bad85	64289463-e48b-4261-bfef-e59b622eb20e	64ea42f1-5306-476a-b2cd-cfe65a894d1b	default-warehouse	0	0	0	10	2026-05-08 07:09:31.477
d8a7c195-a26f-4e1d-b475-d9b47970ff80	64289463-e48b-4261-bfef-e59b622eb20e	e752cecd-c989-4ff8-8f5a-3c64455eef67	default-warehouse	0	0	0	10	2026-05-08 07:09:31.478
65b69e03-f9bc-4aa6-962e-40c453256469	64289463-e48b-4261-bfef-e59b622eb20e	70d5b65c-5cd7-40f8-91ec-e7b7b218c5b8	default-warehouse	20	1	19	10	2026-05-08 07:50:58.828
b090fcda-7fd0-491f-a568-eb88e441fdd6	64289463-e48b-4261-bfef-e59b622eb20e	\N	default-warehouse	99	14	85	10	2026-05-07 11:45:56.203
fa630b05-bc52-4cfb-8927-b597813e65c7	64289463-e48b-4261-bfef-e59b622eb20e	40973815-351e-42b2-99dc-e30539f21968	default-warehouse	20	7	13	10	2026-05-13 11:10:48.301
fc039723-4b20-4b28-850d-956f5ede1dd9	64289463-e48b-4261-bfef-e59b622eb20e	891c80cc-4be3-4853-b2f2-cb896bac7a33	default-warehouse	0	0	0	10	2026-05-08 07:09:31.788
8ecbf34f-6e3c-4a54-865c-96b2cfd61db3	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	default-warehouse	100	2	98	10	2026-05-07 06:55:48.037
caf29d2a-ac95-41a5-a473-731481b1993f	0019bc5a-cfda-423a-8033-04e19527878c	\N	default-warehouse	100	1	99	10	2026-05-08 05:31:15.452
07e81ff3-1553-4678-9036-ade52d4a6643	64289463-e48b-4261-bfef-e59b622eb20e	18e49bc7-2bdb-4383-8637-942828855344	default-warehouse	0	0	0	10	2026-05-08 07:09:31.884
2d9f722d-00ba-432b-a4c4-933685f23035	64289463-e48b-4261-bfef-e59b622eb20e	20ad4b9c-7aa6-4a01-a7de-ff512ece316c	default-warehouse	0	0	0	10	2026-05-08 07:09:31.888
f005258c-8708-44fb-9cf8-d723e7de4cd0	eaacdf54-eaa9-4dcc-839e-a10a61588523	19304891-7368-4eb6-a4f8-bd140381e8d4	default-warehouse	0	0	0	10	2026-05-14 06:14:56.045
11ffd245-2dce-4a7e-ba75-f2ed43770e17	eaacdf54-eaa9-4dcc-839e-a10a61588523	f840ba72-8fdc-4bea-80b0-9ada1f11dba6	default-warehouse	0	0	0	10	2026-05-14 06:14:59.964
1148d7f0-33c0-473e-92a6-0a3c4fe74c27	0019bc5a-cfda-423a-8033-04e19527878c	bbe6abee-df1f-46d4-a47e-593106a4e776	default-warehouse	0	0	0	10	2026-05-08 06:48:57.899
d7d69f94-c73c-4ed8-ba80-89e18c136d9c	0019bc5a-cfda-423a-8033-04e19527878c	3f1e118d-37e7-4268-a7e6-2f10b9491f45	default-warehouse	0	0	0	10	2026-05-08 06:48:57.899
73386270-fb62-492b-b6d6-d6cddc61473b	0019bc5a-cfda-423a-8033-04e19527878c	6fec5888-ccbd-4d0e-b7d1-6c8999ea65d1	default-warehouse	0	0	0	10	2026-05-08 06:48:57.901
75896903-15c9-418e-a638-031201939eb7	0019bc5a-cfda-423a-8033-04e19527878c	e63aed79-432f-41f6-af78-bacef93775d0	default-warehouse	0	0	0	10	2026-05-08 06:48:57.901
6407e9fd-c30c-401b-8076-883fea04edbe	0019bc5a-cfda-423a-8033-04e19527878c	c34d6925-76cf-4577-aca2-539c416a820c	default-warehouse	0	0	0	10	2026-05-08 06:48:57.901
6f06bc1e-8365-46a3-b612-656c70110a4f	0019bc5a-cfda-423a-8033-04e19527878c	69b99237-0ddf-428d-a83e-68526cd7349c	default-warehouse	0	0	0	10	2026-05-08 06:48:57.903
e243db6b-2cd6-46a9-8bd9-00bdc8b344d9	0019bc5a-cfda-423a-8033-04e19527878c	140ff2e8-5a90-4e87-ad63-8cb3786637bc	default-warehouse	0	0	0	10	2026-05-08 06:48:57.908
27283215-c6a6-48e2-94f9-becc5b2c93a6	0019bc5a-cfda-423a-8033-04e19527878c	cd7ac6dd-cc19-45ca-8cf4-983482812c12	default-warehouse	0	0	0	10	2026-05-08 06:48:57.912
df669ba0-8f11-4aa0-9a22-5ff353cf5656	0019bc5a-cfda-423a-8033-04e19527878c	7c5c0c2a-0fb2-47a3-9f49-6d4db0fdbb58	default-warehouse	21	0	21	10	2026-05-09 14:22:58.4
\.


--
-- Data for Name: inventory_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_reservations (id, inventory_item_id, reference_type, reference_id, quantity, expires_at, created_at) FROM stdin;
2cfd0d11-0980-4669-82df-2cff55f1485f	8ecbf34f-6e3c-4a54-865c-96b2cfd61db3	cart	79c0b500-7796-402b-9ff3-82afe2a42441	1	2026-05-04 07:35:56.712	2026-05-04 07:05:56.713
74297627-a7cd-45d8-aa18-0c3c9fd4dfb7	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	0fd997ac-e565-4c0f-9130-424d74939f6c	1	2026-05-04 11:21:53.488	2026-05-04 10:51:53.491
5e7bd6a0-ddbc-46d9-8681-b67d4f24459d	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	025503af-fdab-4850-9c71-1d39d9996aa7	1	2026-05-06 06:49:09.658	2026-05-06 06:19:09.662
895f9527-9ea1-421a-9a9a-a2f9c88021a1	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	9ef02794-b9d8-400b-8a94-549d3c87c94e	1	2026-05-06 08:15:20.36	2026-05-06 07:45:20.364
c96b759c-d1bf-4ce1-b05b-934a15dce57f	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	10bbb443-f919-4f7c-aa39-a4b35ba104e8	1	2026-05-06 10:47:56.868	2026-05-06 10:17:56.871
87c0fbc8-ac5a-469e-93c7-f9ba1a3ef7f0	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	150d1a50-9013-4ba0-adb6-58094cef72db	2	2026-05-06 12:24:14.194	2026-05-06 11:54:14.195
0e7b7c61-8bc6-4fa4-ad41-0313d05e1ccd	8ecbf34f-6e3c-4a54-865c-96b2cfd61db3	cart	2530cc54-0f91-41c0-9fc1-96864b03edad	1	2026-05-07 07:25:48.014	2026-05-07 06:55:48.016
9669e351-64e3-4088-9277-076955ae9228	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	91b43991-b632-47d0-9f35-4373b133aa30	1	2026-05-07 09:20:44.977	2026-05-07 08:50:44.984
125f3ef6-6dec-4f50-b2d3-01241e9eae4d	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	126c6181-f879-461c-b0de-c439d5c9bb94	2	2026-05-07 11:38:19.365	2026-05-07 11:08:19.368
13a8d4f4-e2ba-46c2-aec8-3c6bba89162c	b090fcda-7fd0-491f-a568-eb88e441fdd6	cart	cba8d941-a211-4bd6-97f6-aa37baa3ae97	5	2026-05-07 12:15:56.2	2026-05-07 11:45:56.201
4fc033ba-bd20-460e-a5e4-d3cffc33c5cb	caf29d2a-ac95-41a5-a473-731481b1993f	cart	3b96cc19-ecf4-480b-b66e-c5bc03243169	1	2026-05-08 06:01:15.411	2026-05-08 05:31:15.418
ded3dbfd-1fc5-4106-8ca6-e2063e57bde4	65b69e03-f9bc-4aa6-962e-40c453256469	cart	15c91887-32ef-44cd-a626-019cd8863e23	1	2026-05-08 08:20:58.817	2026-05-08 07:50:58.82
7fc85dc2-cd19-48ce-a956-424e59dec2ba	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	bc74a1fa-7df0-4c43-8f13-6ee9422f1587	1	2026-05-12 06:37:25.056	2026-05-12 06:07:25.058
cfbb5d88-a177-4b41-842e-169ce80801f8	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	0ea01659-0ada-417d-b1b5-6c36c3396459	1	2026-05-12 08:24:44.421	2026-05-12 07:54:44.427
7f006d0d-eb77-445b-b219-fcbcbd85e4d2	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	135be7b1-4437-4307-bfe2-fa8dae093e80	1	2026-05-12 08:43:42.234	2026-05-12 08:13:42.236
dab8d733-daa3-4609-8cfe-f6c13035eb3b	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	ccdf6deb-132e-466f-81ab-2212cc21631a	1	2026-05-12 10:31:13.905	2026-05-12 10:01:13.906
3331cb30-fe30-4fc4-8b79-44e47ce3c2de	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	cd64cb9e-9506-419b-93f9-a56ba8da4454	1	2026-05-12 13:56:02.422	2026-05-12 13:26:02.425
ccdce86f-9c9d-4b8b-9460-b66b243ed16d	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	8090910a-5527-43e1-94b1-88ed61adc313	1	2026-05-13 06:55:45.941	2026-05-13 06:25:45.945
bf49a282-03ae-4ec1-89f2-b2b634285fc4	fa630b05-bc52-4cfb-8927-b597813e65c7	cart	9c818bd2-dec3-4ab2-aa76-4817c8307147	1	2026-05-13 08:15:51.203	2026-05-13 07:45:51.206
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, variant_id, sku, name, attributes, quantity, unit_price, discount_amount, tax_amount, row_total, quantity_fulfilled, quantity_refunded, metadata, created_at) FROM stdin;
21a18e0b-5bed-4136-ac04-678408542837	4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	64289463-e48b-4261-bfef-e59b622eb20e	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004	Test Product	{}	1	32.87	0.00	0.00	32.87	0	0	{}	2026-05-04 07:33:33.36
\.


--
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping (id, order_id, shipping_method_id, cost, currency, status, tracking_number, tracking_url, courier_code, courier_name, shipped_at, delivered_at, cancelled_at, shipping_address, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_taxes (id, order_id, tax_id, tax_class_id, tax_class_code, tax_class_name, country, region, rate, is_inclusive, taxable_amount, tax_amount, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, customer_id, customer_group_id, status, payment_status, fulfillment_status, customer_email, customer_name, billing_address, shipping_address, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, applied_price_rules, ip_address, user_agent, notes, metadata, created_at, updated_at, cancelled_at, completed_at) FROM stdin;
4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	ORD-20260504-00001	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "KARACHI", "label": "HOME A", "phone": "", "state": "SINDH", "company": "", "country": "PK", "lastName": "HUZAIFA", "firstName": "SYED", "postalCode": "74760", "addressLine1": "SAEEDABAD", "addressLine2": ""}	{"city": "KARACHI", "label": "HOME A", "phone": "", "state": "SINDH", "company": "", "country": "PK", "lastName": "HUZAIFA", "firstName": "SYED", "postalCode": "74760", "addressLine1": "SAEEDABAD", "addressLine2": ""}	USD	32.87	0.00	0.00	0.00	32.87	[]	\N	\N	\N	{"checkoutId": "55b4c288-998d-49f9-bd4b-ac10fae8f79f", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-05-04 07:33:33.36	2026-05-04 07:33:33.36	\N	\N
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, provider, flow_type, is_active, config, metadata, created_at, updated_at) FROM stdin;
1f3e4b70-63ff-4b05-a95f-e7b3612dc405	cod	Cash on Delivery	cod	OFFLINE	t	{}	{"sortOrder": 10}	2026-05-04 07:33:12.787	2026-05-12 13:16:46.534
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, payment_method_id, status, flow_type, amount, currency, gateway_transaction_id, client_secret, redirect_url, gateway_response, captured_at, failed_at, refunded_at, created_at, updated_at) FROM stdin;
d88b3cf9-218a-4f6f-bfcd-2fbf58f1909c	4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	32.87	USD	COD-f1a50684-3047-4c91-b51e-b2ae3b6b781c	\N	\N	{"orderId": "4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd", "orderNumber": "ORD-20260504-00001", "paymentMethod": "cod", "transactionId": "COD-f1a50684-3047-4c91-b51e-b2ae3b6b781c"}	\N	\N	\N	2026-05-04 07:33:33.411	2026-05-04 07:33:33.411
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (product_id, category_id, "position") FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, variant_id, url, alt_text, "position", is_primary, created_at) FROM stdin;
5e8d27d5-a04f-417a-9004-ef5dd4535d61	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/aeccf438-009a-4738-8020-b69cb1ab10b8.png	Test Product	0	f	2026-05-05 11:48:44.458
648733bb-0232-4b2b-abcb-aa4d9912f8c8	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/a3ef2b2b-7983-4dc3-a3b3-21dea3ad9ab5.jpeg	Test Product	0	f	2026-05-05 11:56:58.29
7f4f5fef-7a46-4304-bd80-c3c3871efeeb	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/c121e192-cb81-4cd3-a6aa-0f5626018350.jpeg	Test Product	0	t	2026-05-07 08:58:21.484
0c174ab5-fffb-463f-8b50-3f9279e6bb28	0019bc5a-cfda-423a-8033-04e19527878c	\N	http://localhost:3000/uploads/products/2f491573-6056-4a31-8ddc-c069d2c6218c.jpeg	Test Product	0	t	2026-05-07 08:58:45.103
70c79fbc-4b25-4755-8e8a-feb6dfaad1c7	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/50a1d6b7-16e0-44bb-95b7-960d5bb04322.jpg	Test Product	5	f	2026-05-07 13:04:51.397
057521c1-e9b4-4894-91e8-d41f338f353e	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	http://localhost:3000/uploads/products/bba6b20b-b1be-4784-9ff7-43d02cd3e6eb.jpeg	Test Product	0	t	2026-05-14 06:12:59.931
\.


--
-- Data for Name: product_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values (id, option_id, value, code, sort_order, is_active, created_at, updated_at) FROM stdin;
c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4	59574408-864b-4fb3-a08f-5ee2211a8ba1	Vanila	vanila	1	t	2026-05-08 06:39:32.123	2026-05-08 06:39:32.123
63c856d5-fe9d-46d2-9233-0b06a2719141	59574408-864b-4fb3-a08f-5ee2211a8ba1	Chocolate	chocolate	2	t	2026-05-08 06:39:47.977	2026-05-08 06:39:47.977
30d60dcc-867c-4fbd-a208-4aef88480725	59574408-864b-4fb3-a08f-5ee2211a8ba1	Strawberry	strawberry	3	t	2026-05-08 06:40:33.172	2026-05-08 06:40:33.172
e86955c2-ebde-4ba0-9925-743eb1a2371e	906abee1-8c7f-4645-8193-973989132503	1kg	1kg	1	t	2026-05-08 06:41:49.12	2026-05-08 06:41:49.12
f56ce2c9-7e87-4eaf-8588-d6c8822a106e	906abee1-8c7f-4645-8193-973989132503	500g	500g	2	t	2026-05-08 06:42:02.481	2026-05-08 06:42:02.481
0f01dc86-2798-4ffb-9902-663a759b845e	906abee1-8c7f-4645-8193-973989132503	250g	250g	3	t	2026-05-08 06:42:18.355	2026-05-08 06:42:18.355
98acf219-fadc-4e60-88f9-3b660145230d	a39db598-111e-4007-bf54-f564b2c1f587	Family pack	family pack	1	t	2026-05-08 06:44:01.979	2026-05-08 06:44:01.979
e2ca73f9-da0c-4357-ad26-0a3b5234734c	a39db598-111e-4007-bf54-f564b2c1f587	Pack of 2	pack of 2	2	t	2026-05-08 06:44:35.317	2026-05-08 06:44:35.317
d79e5779-4b44-422c-bcb0-43743dba8196	a39db598-111e-4007-bf54-f564b2c1f587	Pack of 3	pack of 3	3	t	2026-05-08 06:46:44.189	2026-05-08 06:46:44.189
\.


--
-- Data for Name: product_option_values_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values_on_products (product_id, option_id, value_id) FROM stdin;
0019bc5a-cfda-423a-8033-04e19527878c	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
0019bc5a-cfda-423a-8033-04e19527878c	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
0019bc5a-cfda-423a-8033-04e19527878c	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
0019bc5a-cfda-423a-8033-04e19527878c	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
0019bc5a-cfda-423a-8033-04e19527878c	a39db598-111e-4007-bf54-f564b2c1f587	e2ca73f9-da0c-4357-ad26-0a3b5234734c
0019bc5a-cfda-423a-8033-04e19527878c	a39db598-111e-4007-bf54-f564b2c1f587	d79e5779-4b44-422c-bcb0-43743dba8196
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
64289463-e48b-4261-bfef-e59b622eb20e	906abee1-8c7f-4645-8193-973989132503	e86955c2-ebde-4ba0-9925-743eb1a2371e
64289463-e48b-4261-bfef-e59b622eb20e	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
64289463-e48b-4261-bfef-e59b622eb20e	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
eaacdf54-eaa9-4dcc-839e-a10a61588523	906abee1-8c7f-4645-8193-973989132503	e86955c2-ebde-4ba0-9925-743eb1a2371e
eaacdf54-eaa9-4dcc-839e-a10a61588523	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
eaacdf54-eaa9-4dcc-839e-a10a61588523	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
\.


--
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options (id, name, code, is_active, created_at, updated_at) FROM stdin;
59574408-864b-4fb3-a08f-5ee2211a8ba1	Flavour	flavour	t	2026-05-08 06:39:04.167	2026-05-08 06:39:04.167
906abee1-8c7f-4645-8193-973989132503	Weight	weight	t	2026-05-08 06:41:25.572	2026-05-08 06:41:25.572
a39db598-111e-4007-bf54-f564b2c1f587	Pack	pack	t	2026-05-08 06:43:46.941	2026-05-08 06:43:46.941
\.


--
-- Data for Name: product_options_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options_on_products (product_id, option_id, is_required, "position") FROM stdin;
0019bc5a-cfda-423a-8033-04e19527878c	59574408-864b-4fb3-a08f-5ee2211a8ba1	t	0
0019bc5a-cfda-423a-8033-04e19527878c	a39db598-111e-4007-bf54-f564b2c1f587	t	1
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	t	0
64289463-e48b-4261-bfef-e59b622eb20e	906abee1-8c7f-4645-8193-973989132503	t	1
eaacdf54-eaa9-4dcc-839e-a10a61588523	906abee1-8c7f-4645-8193-973989132503	t	0
eaacdf54-eaa9-4dcc-839e-a10a61588523	a39db598-111e-4007-bf54-f564b2c1f587	t	1
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, sku, name, price, cost, weight, attributes, "position", is_active, created_at, updated_at) FROM stdin;
2c9efd53-dfc4-48f6-9a5c-9a16df162132	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-STRAWBERRY-250G	Flavour: Strawberry • Weight: 250g	299.00	\N	\N	{"optionValues": {"weight": "250g", "flavour": "Strawberry"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	8	t	2026-05-08 07:09:20.801	2026-05-08 07:16:23.789
18e49bc7-2bdb-4383-8637-942828855344	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-CHOCOLATE-250G	Flavour: Chocolate • Weight: 250g	299.00	\N	\N	{"optionValues": {"weight": "250g", "flavour": "Chocolate"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e", "flavour": "63c856d5-fe9d-46d2-9233-0b06a2719141"}}	5	t	2026-05-08 07:09:20.778	2026-05-08 07:16:23.791
40973815-351e-42b2-99dc-e30539f21968	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-VANILA-1KG	Flavour: Vanila • Weight: 1kg	999.00	\N	\N	{"optionValues": {"weight": "1kg", "flavour": "Vanila"}, "optionValueIds": {"weight": "e86955c2-ebde-4ba0-9925-743eb1a2371e", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	0	t	2026-05-08 07:09:20.731	2026-05-08 07:15:50.997
70d5b65c-5cd7-40f8-91ec-e7b7b218c5b8	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-CHOCOLATE-1KG	Flavour: Chocolate • Weight: 1kg	999.00	\N	\N	{"optionValues": {"weight": "1kg", "flavour": "Chocolate"}, "optionValueIds": {"weight": "e86955c2-ebde-4ba0-9925-743eb1a2371e", "flavour": "63c856d5-fe9d-46d2-9233-0b06a2719141"}}	3	t	2026-05-08 07:09:20.763	2026-05-08 07:15:51.002
891c80cc-4be3-4853-b2f2-cb896bac7a33	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-STRAWBERRY-1KG	Flavour: Strawberry • Weight: 1kg	999.00	\N	\N	{"optionValues": {"weight": "1kg", "flavour": "Strawberry"}, "optionValueIds": {"weight": "e86955c2-ebde-4ba0-9925-743eb1a2371e", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	6	t	2026-05-08 07:09:20.786	2026-05-08 07:15:51.076
e752cecd-c989-4ff8-8f5a-3c64455eef67	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-VANILA-500G	Flavour: Vanila • Weight: 500g	549.00	\N	\N	{"optionValues": {"weight": "500g", "flavour": "Vanila"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	1	t	2026-05-08 07:09:20.747	2026-05-08 07:16:14.267
20ad4b9c-7aa6-4a01-a7de-ff512ece316c	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-CHOCOLATE-500G	Flavour: Chocolate • Weight: 500g	549.00	\N	\N	{"optionValues": {"weight": "500g", "flavour": "Chocolate"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e", "flavour": "63c856d5-fe9d-46d2-9233-0b06a2719141"}}	4	t	2026-05-08 07:09:20.771	2026-05-08 07:16:14.269
13293c57-d881-4a28-b7b6-d16d5054ac55	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-STRAWBERRY-500G	Flavour: Strawberry • Weight: 500g	549.00	\N	\N	{"optionValues": {"weight": "500g", "flavour": "Strawberry"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	7	t	2026-05-08 07:09:20.794	2026-05-08 07:16:14.27
64ea42f1-5306-476a-b2cd-cfe65a894d1b	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-VANILA-250G	Flavour: Vanila • Weight: 250g	299.00	\N	\N	{"optionValues": {"weight": "250g", "flavour": "Vanila"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	2	t	2026-05-08 07:09:20.755	2026-05-08 07:16:23.789
19304891-7368-4eb6-a4f8-bd140381e8d4	eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003-1KG-FAMILY-PACK	Weight: 1kg • Pack: Family pack	999.00	\N	\N	{"optionValues": {"pack": "Family pack", "weight": "1kg"}, "optionValueIds": {"pack": "98acf219-fadc-4e60-88f9-3b660145230d", "weight": "e86955c2-ebde-4ba0-9925-743eb1a2371e"}}	0	t	2026-05-14 06:14:12.449	2026-05-14 06:16:45.858
f840ba72-8fdc-4bea-80b0-9ada1f11dba6	eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003-500G-FAMILY-PACK	Weight: 500g • Pack: Family pack	499.00	\N	\N	{"optionValues": {"pack": "Family pack", "weight": "500g"}, "optionValueIds": {"pack": "98acf219-fadc-4e60-88f9-3b660145230d", "weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	1	t	2026-05-14 06:14:12.467	2026-05-14 06:16:57.773
7c5c0c2a-0fb2-47a3-9f49-6d4db0fdbb58	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-VANILA-FAMILY-PACK	Flavour: Vanila • Pack: Family pack	30.99	\N	\N	{"optionValues": {"pack": "Family pack", "flavour": "Vanila"}, "optionValueIds": {"pack": "98acf219-fadc-4e60-88f9-3b660145230d", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	0	t	2026-05-08 06:48:48.477	2026-05-08 06:48:48.477
3f1e118d-37e7-4268-a7e6-2f10b9491f45	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-VANILA-PACK-OF-2	Flavour: Vanila • Pack: Pack of 2	30.99	\N	\N	{"optionValues": {"pack": "Pack of 2", "flavour": "Vanila"}, "optionValueIds": {"pack": "e2ca73f9-da0c-4357-ad26-0a3b5234734c", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	1	t	2026-05-08 06:48:48.498	2026-05-08 06:48:48.498
140ff2e8-5a90-4e87-ad63-8cb3786637bc	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-VANILA-PACK-OF-3	Flavour: Vanila • Pack: Pack of 3	30.99	\N	\N	{"optionValues": {"pack": "Pack of 3", "flavour": "Vanila"}, "optionValueIds": {"pack": "d79e5779-4b44-422c-bcb0-43743dba8196", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	2	t	2026-05-08 06:48:48.507	2026-05-08 06:48:48.507
e63aed79-432f-41f6-af78-bacef93775d0	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-CHOCOLATE-FAMILY-PACK	Flavour: Chocolate • Pack: Family pack	30.99	\N	\N	{"optionValues": {"pack": "Family pack", "flavour": "Chocolate"}, "optionValueIds": {"pack": "98acf219-fadc-4e60-88f9-3b660145230d", "flavour": "63c856d5-fe9d-46d2-9233-0b06a2719141"}}	3	t	2026-05-08 06:48:48.515	2026-05-08 06:48:48.515
69b99237-0ddf-428d-a83e-68526cd7349c	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-CHOCOLATE-PACK-OF-2	Flavour: Chocolate • Pack: Pack of 2	30.99	\N	\N	{"optionValues": {"pack": "Pack of 2", "flavour": "Chocolate"}, "optionValueIds": {"pack": "e2ca73f9-da0c-4357-ad26-0a3b5234734c", "flavour": "63c856d5-fe9d-46d2-9233-0b06a2719141"}}	4	t	2026-05-08 06:48:48.523	2026-05-08 06:48:48.523
c34d6925-76cf-4577-aca2-539c416a820c	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-CHOCOLATE-PACK-OF-3	Flavour: Chocolate • Pack: Pack of 3	30.99	\N	\N	{"optionValues": {"pack": "Pack of 3", "flavour": "Chocolate"}, "optionValueIds": {"pack": "d79e5779-4b44-422c-bcb0-43743dba8196", "flavour": "63c856d5-fe9d-46d2-9233-0b06a2719141"}}	5	t	2026-05-08 06:48:48.531	2026-05-08 06:48:48.531
cd7ac6dd-cc19-45ca-8cf4-983482812c12	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-STRAWBERRY-FAMILY-PACK	Flavour: Strawberry • Pack: Family pack	30.99	\N	\N	{"optionValues": {"pack": "Family pack", "flavour": "Strawberry"}, "optionValueIds": {"pack": "98acf219-fadc-4e60-88f9-3b660145230d", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	6	t	2026-05-08 06:48:48.539	2026-05-08 06:48:48.539
bbe6abee-df1f-46d4-a47e-593106a4e776	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-STRAWBERRY-PACK-OF-2	Flavour: Strawberry • Pack: Pack of 2	30.99	\N	\N	{"optionValues": {"pack": "Pack of 2", "flavour": "Strawberry"}, "optionValueIds": {"pack": "e2ca73f9-da0c-4357-ad26-0a3b5234734c", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	7	t	2026-05-08 06:48:48.546	2026-05-08 06:48:48.546
6fec5888-ccbd-4d0e-b7d1-6c8999ea65d1	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-STRAWBERRY-PACK-OF-3	Flavour: Strawberry • Pack: Pack of 3	30.99	\N	\N	{"optionValues": {"pack": "Pack of 3", "flavour": "Strawberry"}, "optionValueIds": {"pack": "d79e5779-4b44-422c-bcb0-43743dba8196", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	8	t	2026-05-08 06:48:48.553	2026-05-08 06:48:48.553
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, slug, type, description, short_description, base_price, cost, weight, status, visibility, tax_class_id, attributes, meta_data, created_at, updated_at, deleted_at) FROM stdin;
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001	Test Product	test-product	simple	\N	\N	29.99	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:27.174	2026-05-04 06:49:27.174	\N
0019bc5a-cfda-423a-8033-04e19527878c	SKU-002	Test Product	test-product-1	simple	\N	\N	30.99	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:39.284	2026-05-07 08:58:45.008	\N
64289463-e48b-4261-bfef-e59b622eb20e	SKU-004	Test Product	test-product-3	configurable	\N	\N	299.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:50:26.021	2026-05-13 06:23:41.271	\N
eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003	cococut barfi	test-product-2	configurable	\N	\N	999.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:51.979	2026-05-14 06:18:44.037	\N
\.


--
-- Data for Name: promotion_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_customer_groups (id, promotion_id, customer_group_id, is_excluded) FROM stdin;
\.


--
-- Data for Name: promotion_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_logs (id, promotion_id, cart_id, checkout_id, order_id, customer_id, coupon_code, discount_amount, subtotal_before, subtotal_after, status, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_products (id, promotion_id, product_id, variant_id, category_id) FROM stdin;
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, code, name, description, type, status, discount_value, discount_type, scope, is_stackable, is_exclusive, applies_to_all_groups, conditions, usage_limit, usage_limit_per_user, current_usage, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
e7fc56cd-648e-4d62-8a07-784dfe89a278	5255	may discount offer	10% off on every product	percentage	active	10.00	percentage	cart	f	t	t	{}	\N	\N	0	\N	\N	{}	2026-05-12 08:15:49.738	2026-05-12 08:16:19.666
\.


--
-- Data for Name: shipping_method_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_method_customer_groups (id, shipping_method_id, customer_group_id, discount_percent, fixed_cost, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_methods (id, zone_id, code, name, description, type, config, min_order_amount, max_order_amount, min_weight, max_weight, priority, is_active, courier_config, metadata, created_at, updated_at) FROM stdin;
67b1cc73-d1a5-4f53-acd2-a3489f62c963	5c1fd339-aed0-4bdb-9b4c-d6444fb5a6d5	flat-standard	Standard Shipping	\N	flat_rate	{"cost": 100}	\N	\N	\N	\N	0	t	{}	{}	2026-05-04 07:04:16.157	2026-05-04 07:04:16.157
00000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000001	standard	Standard Shipping	Standard delivery	flat_rate	{"cost": 99}	\N	\N	\N	\N	0	t	{}	{}	2026-05-06 11:10:43.414	2026-05-12 13:16:46.506
\.


--
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_zones (id, name, description, coverage, priority, is_active, metadata, created_at, updated_at) FROM stdin;
5c1fd339-aed0-4bdb-9b4c-d6444fb5a6d5	STANDARD	standard zone	{"countries": ["PK"]}	10	t	{}	2026-05-04 07:03:53.831	2026-05-04 07:03:53.831
00000000-0000-0000-0000-000000000001	Default	Default zone for all addresses	{}	0	t	{}	2026-05-06 11:10:43.28	2026-05-06 11:10:43.28
\.


--
-- Data for Name: storefront_filter_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_options (id, filter_id, value, label, sort_order, is_active, created_at, updated_at) FROM stdin;
e34eac23-420a-4bb3-b085-ebebfc53b391	80fee301-d334-438f-9137-6bf3095754c4	250g	\N	1	t	2026-05-13 13:29:04.136	2026-05-13 13:38:15.519
87fd742c-10c0-4fdd-b79e-a4b184689a91	80fee301-d334-438f-9137-6bf3095754c4	500g	\N	2	t	2026-05-13 13:28:58.586	2026-05-13 13:38:18.286
7067e462-eaea-4917-b996-27f10488944e	80fee301-d334-438f-9137-6bf3095754c4	1kg	\N	3	t	2026-05-13 13:28:34.311	2026-05-13 13:38:22.516
07fc4a04-49f9-4f3b-bd7a-eeb890ed469c	4fdd559f-69b8-4404-afcc-94fe93667d82	Chocolate	\N	1	t	2026-05-14 06:46:41.256	2026-05-14 06:46:41.256
a7040cbc-aeec-4c04-b694-f6d6b5c202b7	4fdd559f-69b8-4404-afcc-94fe93667d82	Vanila	\N	0	t	2026-05-14 06:47:08.763	2026-05-14 06:47:08.763
a726ebec-b292-49e7-a7ba-005153221537	4fdd559f-69b8-4404-afcc-94fe93667d82	Strawberry	\N	2	t	2026-05-14 06:47:20.886	2026-05-14 06:47:20.886
\.


--
-- Data for Name: storefront_filter_tree_nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_tree_nodes (id, filter_id, parent_id, nav_link_id, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: storefront_filters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filters (id, code, name, kind, sort_order, is_active, created_at, updated_at) FROM stdin;
4635a7d1-abb9-47c1-9f26-bbb9bc26a5d0	price	Price	PRICE	1	t	2026-05-12 13:16:46.699	2026-05-13 11:23:36.946
80fee301-d334-438f-9137-6bf3095754c4	weight	Weight	ATTRIBUTE	2	t	2026-05-12 13:16:46.705	2026-05-14 06:41:35.414
4fdd559f-69b8-4404-afcc-94fe93667d82	flavour	Flavour	ATTRIBUTE	0	t	2026-05-14 06:44:11.2	2026-05-14 06:46:15.082
\.


--
-- Data for Name: storefront_nav_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_nav_links (id, label, secondary_label, href, sort_order, is_active, kind, created_at, updated_at, zone, parent_id, category_id, open_mega_menu, banner_image_url, banner_href, banner_alt) FROM stdin;
00000000-0000-0000-0000-00000000e001	Home	\N	/	0	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e003	Track order	\N	/track-order	20	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e005	Cart	\N	/cart	40	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
c321a5fa-2fdb-4370-be83-1898acfb9828	1kg	\N	http://localhost:3001/products/test-product-3	1	t	LINK	2026-05-13 10:41:15.89	2026-05-13 10:41:15.89	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
18280818-a3d3-4764-8a0d-b5952e04db68	500g	\N	http://localhost:3001/products/test-product-3	2	t	LINK	2026-05-13 10:41:43.833	2026-05-13 10:41:43.833	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
fb69a8e5-27c1-4293-ba49-c190a5f3c738	250g	\N	http://localhost:3001/products/test-product-3	3	t	LINK	2026-05-13 10:41:59.442	2026-05-13 10:41:59.442	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
3509717e-86ed-4d2b-967d-a05d27ce9803	Flavour	\N	/	0	t	LINK	2026-05-14 06:09:17.438	2026-05-14 06:09:34.95	mega	\N	\N	f	\N	\N	\N
2c47212c-1930-4afc-b697-68c49aa95b8b	Weight	\N	/	2	t	LINK	2026-05-13 10:40:56.931	2026-05-14 06:09:42.598	mega	\N	\N	f	\N	\N	\N
e32719a8-318c-4128-95d2-e7a3fd2114b7	Vanila	\N	http://localhost:3001/products	0	t	LINK	2026-05-14 06:10:17.76	2026-05-14 06:10:17.76	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
4c2bb66a-2a63-4131-9f8c-3d3bebf60a1c	Strawberry	\N	http://localhost:3001/products	2	t	LINK	2026-05-14 06:10:44.534	2026-05-14 06:10:44.534	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
81d8f5e2-1c54-491f-ab15-66531ce3d9f3	Chocolate	\N	http://localhost:3001/products	1	t	LINK	2026-05-14 06:10:32.81	2026-05-14 06:10:57.91	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
e470e2bf-0acb-4cc6-8651-49b7154e25fe	Three Milk Cake	\N	http://localhost:3001/products/test-product-3	0	t	LINK	2026-05-13 10:44:41.631	2026-05-14 06:12:07.096	mega	6f6c4165-e162-4ebd-ad78-987a42165c3a	\N	f	\N	\N	\N
8a0a4887-c075-4284-819d-3c2d6b0c4832	Cocunut barfi	\N	http://localhost:3001/products/test-product-2	1	t	LINK	2026-05-14 06:12:00.063	2026-05-14 06:15:14.649	mega	6f6c4165-e162-4ebd-ad78-987a42165c3a	\N	f	\N	\N	\N
6f6c4165-e162-4ebd-ad78-987a42165c3a	Signature Items	\N	/	1	t	LINK	2026-05-13 10:44:23.917	2026-05-14 08:33:45.73	mega	\N	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e002	Products	Categories	/products	10	t	LINK	2026-05-13 11:15:47.684	2026-05-14 12:06:21.738	header	\N	\N	t	http://localhost:3000/uploads/storefront-nav/dbc94ab7-7952-4dfb-bac3-59d3a0e82f55.jpeg	\N	\N
\.


--
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, email, source, created_at, updated_at) FROM stdin;
a250fe70-372b-4bb2-95cc-da0e7154c67f	smhuzaifa525@gmail.com	account	2026-05-12 07:44:19.981	2026-05-12 07:44:19.981
\.


--
-- Data for Name: tax_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_classes (id, code, name, description, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taxes (id, tax_class_id, country, region, rate, is_inclusive, is_active, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: variant_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variant_option_values (variant_id, option_id, value_id) FROM stdin;
7c5c0c2a-0fb2-47a3-9f49-6d4db0fdbb58	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
7c5c0c2a-0fb2-47a3-9f49-6d4db0fdbb58	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
3f1e118d-37e7-4268-a7e6-2f10b9491f45	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
3f1e118d-37e7-4268-a7e6-2f10b9491f45	a39db598-111e-4007-bf54-f564b2c1f587	e2ca73f9-da0c-4357-ad26-0a3b5234734c
140ff2e8-5a90-4e87-ad63-8cb3786637bc	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
140ff2e8-5a90-4e87-ad63-8cb3786637bc	a39db598-111e-4007-bf54-f564b2c1f587	d79e5779-4b44-422c-bcb0-43743dba8196
e63aed79-432f-41f6-af78-bacef93775d0	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
e63aed79-432f-41f6-af78-bacef93775d0	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
69b99237-0ddf-428d-a83e-68526cd7349c	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
69b99237-0ddf-428d-a83e-68526cd7349c	a39db598-111e-4007-bf54-f564b2c1f587	e2ca73f9-da0c-4357-ad26-0a3b5234734c
c34d6925-76cf-4577-aca2-539c416a820c	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
c34d6925-76cf-4577-aca2-539c416a820c	a39db598-111e-4007-bf54-f564b2c1f587	d79e5779-4b44-422c-bcb0-43743dba8196
cd7ac6dd-cc19-45ca-8cf4-983482812c12	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
cd7ac6dd-cc19-45ca-8cf4-983482812c12	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
bbe6abee-df1f-46d4-a47e-593106a4e776	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
bbe6abee-df1f-46d4-a47e-593106a4e776	a39db598-111e-4007-bf54-f564b2c1f587	e2ca73f9-da0c-4357-ad26-0a3b5234734c
6fec5888-ccbd-4d0e-b7d1-6c8999ea65d1	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
6fec5888-ccbd-4d0e-b7d1-6c8999ea65d1	a39db598-111e-4007-bf54-f564b2c1f587	d79e5779-4b44-422c-bcb0-43743dba8196
40973815-351e-42b2-99dc-e30539f21968	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
40973815-351e-42b2-99dc-e30539f21968	906abee1-8c7f-4645-8193-973989132503	e86955c2-ebde-4ba0-9925-743eb1a2371e
e752cecd-c989-4ff8-8f5a-3c64455eef67	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
e752cecd-c989-4ff8-8f5a-3c64455eef67	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
64ea42f1-5306-476a-b2cd-cfe65a894d1b	59574408-864b-4fb3-a08f-5ee2211a8ba1	c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4
64ea42f1-5306-476a-b2cd-cfe65a894d1b	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
70d5b65c-5cd7-40f8-91ec-e7b7b218c5b8	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
70d5b65c-5cd7-40f8-91ec-e7b7b218c5b8	906abee1-8c7f-4645-8193-973989132503	e86955c2-ebde-4ba0-9925-743eb1a2371e
20ad4b9c-7aa6-4a01-a7de-ff512ece316c	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
20ad4b9c-7aa6-4a01-a7de-ff512ece316c	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
18e49bc7-2bdb-4383-8637-942828855344	59574408-864b-4fb3-a08f-5ee2211a8ba1	63c856d5-fe9d-46d2-9233-0b06a2719141
18e49bc7-2bdb-4383-8637-942828855344	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
891c80cc-4be3-4853-b2f2-cb896bac7a33	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
891c80cc-4be3-4853-b2f2-cb896bac7a33	906abee1-8c7f-4645-8193-973989132503	e86955c2-ebde-4ba0-9925-743eb1a2371e
13293c57-d881-4a28-b7b6-d16d5054ac55	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
13293c57-d881-4a28-b7b6-d16d5054ac55	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
2c9efd53-dfc4-48f6-9a5c-9a16df162132	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
2c9efd53-dfc4-48f6-9a5c-9a16df162132	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
19304891-7368-4eb6-a4f8-bd140381e8d4	906abee1-8c7f-4645-8193-973989132503	e86955c2-ebde-4ba0-9925-743eb1a2371e
19304891-7368-4eb6-a4f8-bd140381e8d4	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
f840ba72-8fdc-4bea-80b0-9ada1f11dba6	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
f840ba72-8fdc-4bea-80b0-9ada1f11dba6	a39db598-111e-4007-bf54-f564b2c1f587	98acf219-fadc-4e60-88f9-3b660145230d
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account_creation_tokens account_creation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_creation_tokens
    ADD CONSTRAINT account_creation_tokens_pkey PRIMARY KEY (id);


--
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- Name: admin_role_permissions admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- Name: admin_user_roles admin_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: cms_banner_sliders cms_banner_sliders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_sliders
    ADD CONSTRAINT cms_banner_sliders_pkey PRIMARY KEY (id);


--
-- Name: cms_banner_slides cms_banner_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_pkey PRIMARY KEY (id);


--
-- Name: cms_blocks cms_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_blocks
    ADD CONSTRAINT cms_blocks_pkey PRIMARY KEY (id);


--
-- Name: cms_pages cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_pages
    ADD CONSTRAINT cms_pages_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_groups customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_groups
    ADD CONSTRAINT customer_groups_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- Name: order_taxes order_taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_option_values_on_products product_option_values_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_pkey PRIMARY KEY (product_id, option_id, value_id);


--
-- Name: product_option_values product_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_pkey PRIMARY KEY (id);


--
-- Name: product_options_on_products product_options_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_pkey PRIMARY KEY (product_id, option_id);


--
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promotion_customer_groups promotion_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_pkey PRIMARY KEY (id);


--
-- Name: promotion_logs promotion_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_pkey PRIMARY KEY (id);


--
-- Name: promotion_products promotion_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: shipping_method_customer_groups shipping_method_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_pkey PRIMARY KEY (id);


--
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: storefront_filter_options storefront_filter_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_pkey PRIMARY KEY (id);


--
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_pkey PRIMARY KEY (id);


--
-- Name: storefront_filters storefront_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filters
    ADD CONSTRAINT storefront_filters_pkey PRIMARY KEY (id);


--
-- Name: storefront_nav_links storefront_nav_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: tax_classes tax_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_classes
    ADD CONSTRAINT tax_classes_pkey PRIMARY KEY (id);


--
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- Name: variant_option_values variant_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_pkey PRIMARY KEY (variant_id, option_id);


--
-- Name: account_creation_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_email_idx ON public.account_creation_tokens USING btree (email);


--
-- Name: account_creation_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_expires_at_idx ON public.account_creation_tokens USING btree (expires_at);


--
-- Name: account_creation_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_token_idx ON public.account_creation_tokens USING btree (token);


--
-- Name: account_creation_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX account_creation_tokens_token_key ON public.account_creation_tokens USING btree (token);


--
-- Name: admin_permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_permissions_key_key ON public.admin_permissions USING btree (key);


--
-- Name: admin_roles_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_roles_slug_key ON public.admin_roles USING btree (slug);


--
-- Name: admin_users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_email_idx ON public.admin_users USING btree (email);


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: admin_users_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_is_active_idx ON public.admin_users USING btree (is_active);


--
-- Name: categories_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_is_active_idx ON public.categories USING btree (is_active);


--
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: cms_banner_sliders_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_sliders_identifier_is_active_idx ON public.cms_banner_sliders USING btree (identifier, is_active);


--
-- Name: cms_banner_sliders_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_banner_sliders_identifier_key ON public.cms_banner_sliders USING btree (identifier);


--
-- Name: cms_banner_slides_slider_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_is_active_idx ON public.cms_banner_slides USING btree (slider_id, is_active);


--
-- Name: cms_banner_slides_slider_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_sort_order_idx ON public.cms_banner_slides USING btree (slider_id, sort_order);


--
-- Name: cms_blocks_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_blocks_identifier_is_active_idx ON public.cms_blocks USING btree (identifier, is_active);


--
-- Name: cms_blocks_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_blocks_identifier_key ON public.cms_blocks USING btree (identifier);


--
-- Name: cms_pages_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_pages_slug_key ON public.cms_pages USING btree (slug);


--
-- Name: cms_pages_slug_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_slug_status_idx ON public.cms_pages USING btree (slug, status);


--
-- Name: cms_pages_status_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_status_updated_at_idx ON public.cms_pages USING btree (status, updated_at DESC);


--
-- Name: customer_addresses_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_addresses_customer_id_idx ON public.customer_addresses USING btree (customer_id);


--
-- Name: customer_groups_is_default_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_is_default_idx ON public.customer_groups USING btree (is_default);


--
-- Name: customer_groups_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_tax_class_id_idx ON public.customer_groups USING btree (tax_class_id);


--
-- Name: customers_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_customer_group_id_idx ON public.customers USING btree (customer_group_id);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- Name: customers_is_guest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_is_guest_idx ON public.customers USING btree (is_guest);


--
-- Name: inventory_items_available_quantity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_available_quantity_idx ON public.inventory_items USING btree (available_quantity);


--
-- Name: inventory_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_product_id_idx ON public.inventory_items USING btree (product_id);


--
-- Name: inventory_items_product_id_variant_id_warehouse_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inventory_items_product_id_variant_id_warehouse_id_key ON public.inventory_items USING btree (product_id, variant_id, warehouse_id);


--
-- Name: inventory_items_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_variant_id_idx ON public.inventory_items USING btree (variant_id);


--
-- Name: inventory_reservations_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_expires_at_idx ON public.inventory_reservations USING btree (expires_at);


--
-- Name: inventory_reservations_reference_type_reference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_reference_type_reference_id_idx ON public.inventory_reservations USING btree (reference_type, reference_id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- Name: order_shipping_courier_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_courier_code_idx ON public.order_shipping USING btree (courier_code);


--
-- Name: order_shipping_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_order_id_idx ON public.order_shipping USING btree (order_id);


--
-- Name: order_shipping_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX order_shipping_order_id_key ON public.order_shipping USING btree (order_id);


--
-- Name: order_shipping_shipped_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipped_at_idx ON public.order_shipping USING btree (shipped_at);


--
-- Name: order_shipping_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipping_method_id_idx ON public.order_shipping USING btree (shipping_method_id);


--
-- Name: order_shipping_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_status_idx ON public.order_shipping USING btree (status);


--
-- Name: order_shipping_tracking_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_tracking_number_idx ON public.order_shipping USING btree (tracking_number);


--
-- Name: order_taxes_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_order_id_idx ON public.order_taxes USING btree (order_id);


--
-- Name: order_taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_class_id_idx ON public.order_taxes USING btree (tax_class_id);


--
-- Name: order_taxes_tax_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_id_idx ON public.order_taxes USING btree (tax_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at DESC);


--
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: payment_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_code_idx ON public.payment_methods USING btree (code);


--
-- Name: payment_methods_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_methods_code_key ON public.payment_methods USING btree (code);


--
-- Name: payment_methods_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_is_active_idx ON public.payment_methods USING btree (is_active);


--
-- Name: payment_methods_provider_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_provider_idx ON public.payment_methods USING btree (provider);


--
-- Name: payments_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_created_at_idx ON public.payments USING btree (created_at DESC);


--
-- Name: payments_gateway_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_gateway_transaction_id_idx ON public.payments USING btree (gateway_transaction_id);


--
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_order_id_idx ON public.payments USING btree (order_id);


--
-- Name: payments_payment_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_method_id_idx ON public.payments USING btree (payment_method_id);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: product_categories_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_category_id_idx ON public.product_categories USING btree (category_id);


--
-- Name: product_categories_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_product_id_idx ON public.product_categories USING btree (product_id);


--
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- Name: product_images_product_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_is_primary_idx ON public.product_images USING btree (product_id, is_primary);


--
-- Name: product_images_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_idx ON public.product_images USING btree (variant_id);


--
-- Name: product_images_variant_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_is_primary_idx ON public.product_images USING btree (variant_id, is_primary);


--
-- Name: product_option_values_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_is_active_idx ON public.product_option_values USING btree (is_active);


--
-- Name: product_option_values_on_products_product_id_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_product_id_option_id_idx ON public.product_option_values_on_products USING btree (product_id, option_id);


--
-- Name: product_option_values_on_products_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_value_id_idx ON public.product_option_values_on_products USING btree (value_id);


--
-- Name: product_option_values_option_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_option_id_sort_order_idx ON public.product_option_values USING btree (option_id, sort_order);


--
-- Name: product_option_values_option_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_option_values_option_id_value_key ON public.product_option_values USING btree (option_id, value);


--
-- Name: product_options_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_code_idx ON public.product_options USING btree (code);


--
-- Name: product_options_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_options_code_key ON public.product_options USING btree (code);


--
-- Name: product_options_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_is_active_idx ON public.product_options USING btree (is_active);


--
-- Name: product_options_on_products_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_option_id_idx ON public.product_options_on_products USING btree (option_id);


--
-- Name: product_options_on_products_product_id_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_product_id_position_idx ON public.product_options_on_products USING btree (product_id, "position");


--
-- Name: product_variants_is_active_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_is_active_product_id_idx ON public.product_variants USING btree (is_active, product_id);


--
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: products_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_deleted_at_idx ON public.products USING btree (status, deleted_at);


--
-- Name: products_visibility_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_visibility_status_deleted_at_idx ON public.products USING btree (visibility, status, deleted_at);


--
-- Name: promotion_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_customer_group_id_idx ON public.promotion_customer_groups USING btree (customer_group_id);


--
-- Name: promotion_customer_groups_promotion_id_customer_group_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotion_customer_groups_promotion_id_customer_group_id_key ON public.promotion_customer_groups USING btree (promotion_id, customer_group_id);


--
-- Name: promotion_customer_groups_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_idx ON public.promotion_customer_groups USING btree (promotion_id);


--
-- Name: promotion_customer_groups_promotion_id_is_excluded_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_is_excluded_idx ON public.promotion_customer_groups USING btree (promotion_id, is_excluded);


--
-- Name: promotion_logs_cart_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_cart_id_idx ON public.promotion_logs USING btree (cart_id);


--
-- Name: promotion_logs_checkout_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_checkout_id_idx ON public.promotion_logs USING btree (checkout_id);


--
-- Name: promotion_logs_coupon_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_coupon_code_idx ON public.promotion_logs USING btree (coupon_code);


--
-- Name: promotion_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_created_at_idx ON public.promotion_logs USING btree (created_at DESC);


--
-- Name: promotion_logs_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_customer_id_idx ON public.promotion_logs USING btree (customer_id);


--
-- Name: promotion_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_order_id_idx ON public.promotion_logs USING btree (order_id);


--
-- Name: promotion_logs_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_promotion_id_idx ON public.promotion_logs USING btree (promotion_id);


--
-- Name: promotion_products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_category_id_idx ON public.promotion_products USING btree (category_id);


--
-- Name: promotion_products_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_product_id_idx ON public.promotion_products USING btree (product_id);


--
-- Name: promotion_products_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_promotion_id_idx ON public.promotion_products USING btree (promotion_id);


--
-- Name: promotion_products_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_variant_id_idx ON public.promotion_products USING btree (variant_id);


--
-- Name: promotions_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_code_idx ON public.promotions USING btree (code);


--
-- Name: promotions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotions_code_key ON public.promotions USING btree (code);


--
-- Name: promotions_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_start_date_end_date_idx ON public.promotions USING btree (start_date, end_date);


--
-- Name: promotions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_idx ON public.promotions USING btree (status);


--
-- Name: promotions_status_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_start_date_end_date_idx ON public.promotions USING btree (status, start_date, end_date);


--
-- Name: shipping_method_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_customer_group_id_idx ON public.shipping_method_customer_groups USING btree (customer_group_id);


--
-- Name: shipping_method_customer_groups_shipping_method_id_customer_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX shipping_method_customer_groups_shipping_method_id_customer_key ON public.shipping_method_customer_groups USING btree (shipping_method_id, customer_group_id);


--
-- Name: shipping_method_customer_groups_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_shipping_method_id_idx ON public.shipping_method_customer_groups USING btree (shipping_method_id);


--
-- Name: shipping_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_code_idx ON public.shipping_methods USING btree (code);


--
-- Name: shipping_methods_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_is_active_priority_idx ON public.shipping_methods USING btree (is_active, priority);


--
-- Name: shipping_methods_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_type_idx ON public.shipping_methods USING btree (type);


--
-- Name: shipping_methods_zone_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_zone_id_idx ON public.shipping_methods USING btree (zone_id);


--
-- Name: shipping_zones_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_is_active_priority_idx ON public.shipping_zones USING btree (is_active, priority);


--
-- Name: shipping_zones_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_priority_idx ON public.shipping_zones USING btree (priority);


--
-- Name: storefront_filter_options_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_options_filter_id_is_active_sort_order_idx ON public.storefront_filter_options USING btree (filter_id, is_active, sort_order);


--
-- Name: storefront_filter_options_filter_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_options_filter_id_value_key ON public.storefront_filter_options USING btree (filter_id, value);


--
-- Name: storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, is_active, sort_order);


--
-- Name: storefront_filter_tree_nodes_filter_id_nav_link_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_tree_nodes_filter_id_nav_link_id_key ON public.storefront_filter_tree_nodes USING btree (filter_id, nav_link_id);


--
-- Name: storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, parent_id, sort_order);


--
-- Name: storefront_filters_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filters_code_key ON public.storefront_filters USING btree (code);


--
-- Name: storefront_filters_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filters_is_active_sort_order_idx ON public.storefront_filters USING btree (is_active, sort_order);


--
-- Name: storefront_nav_links_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_is_active_sort_order_idx ON public.storefront_nav_links USING btree (is_active, sort_order);


--
-- Name: storefront_nav_links_zone_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_zone_parent_id_sort_order_idx ON public.storefront_nav_links USING btree (zone, parent_id, sort_order);


--
-- Name: subscribers_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscribers_created_at_idx ON public.subscribers USING btree (created_at DESC);


--
-- Name: subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers USING btree (email);


--
-- Name: tax_classes_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tax_classes_code_idx ON public.tax_classes USING btree (code);


--
-- Name: tax_classes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tax_classes_code_key ON public.tax_classes USING btree (code);


--
-- Name: taxes_country_region_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_idx ON public.taxes USING btree (country, region);


--
-- Name: taxes_country_region_tax_class_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_tax_class_id_is_active_idx ON public.taxes USING btree (country, region, tax_class_id, is_active);


--
-- Name: taxes_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_is_active_idx ON public.taxes USING btree (is_active);


--
-- Name: taxes_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_start_date_end_date_idx ON public.taxes USING btree (start_date, end_date);


--
-- Name: taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_tax_class_id_idx ON public.taxes USING btree (tax_class_id);


--
-- Name: variant_option_values_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_option_id_idx ON public.variant_option_values USING btree (option_id);


--
-- Name: variant_option_values_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_value_id_idx ON public.variant_option_values USING btree (value_id);


--
-- Name: variant_option_values_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_variant_id_idx ON public.variant_option_values USING btree (variant_id);


--
-- Name: admin_role_permissions admin_role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_role_permissions admin_role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_user_roles admin_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_user_roles admin_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cms_banner_slides cms_banner_slides_slider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_slider_id_fkey FOREIGN KEY (slider_id) REFERENCES public.cms_banner_sliders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customers customers_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_reservations inventory_reservations_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping order_shipping_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping order_shipping_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_taxes order_taxes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_taxes order_taxes_tax_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES public.taxes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_categories product_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_option_values_on_products product_option_values_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_option_values_on_products product_option_values_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_option_values_on_products product_option_values_on_products_product_id_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_option_id_fkey FOREIGN KEY (product_id, option_id) REFERENCES public.product_options_on_products(product_id, option_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_option_values_on_products product_option_values_on_products_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_option_values product_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_options_on_products product_options_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_options_on_products product_options_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_customer_groups promotion_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_customer_groups promotion_customer_groups_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_logs promotion_logs_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_products promotion_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_method_customer_groups shipping_method_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_method_customer_groups shipping_method_customer_groups_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_methods shipping_methods_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: storefront_filter_options storefront_filter_options_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_nav_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_nav_link_id_fkey FOREIGN KEY (nav_link_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_filter_tree_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: storefront_nav_links storefront_nav_links_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: storefront_nav_links storefront_nav_links_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: taxes taxes_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_tax_class_id_fkey FOREIGN KEY (tax_class_id) REFERENCES public.tax_classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_option_values variant_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_option_values variant_option_values_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_option_values variant_option_values_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict usEvP7wuccpT0bO7I6l5zxYcTxhWMapsaC45twdggbmVxFGC8NvgnkV8WWQu3BZ

