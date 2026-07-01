--
-- PostgreSQL database dump
--

\restrict iuTTj5HRwsLoyMJRnfo1U49G00qRITbh42yaf2blhEPuIY0hubdpAqjTUPrfV4D

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-22 15:33:22

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
-- TOC entry 5 (class 2615 OID 19867)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 21016)
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
-- TOC entry 220 (class 1259 OID 21028)
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
-- TOC entry 221 (class 1259 OID 21039)
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
-- TOC entry 222 (class 1259 OID 21048)
-- Name: admin_role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.admin_role_permissions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 21053)
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
-- TOC entry 224 (class 1259 OID 21066)
-- Name: admin_user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


ALTER TABLE public.admin_user_roles OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 21071)
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
-- TOC entry 226 (class 1259 OID 21084)
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
-- TOC entry 227 (class 1259 OID 21099)
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
-- TOC entry 228 (class 1259 OID 21112)
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
-- TOC entry 229 (class 1259 OID 21128)
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
-- TOC entry 230 (class 1259 OID 21142)
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
-- TOC entry 231 (class 1259 OID 21156)
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
-- TOC entry 232 (class 1259 OID 21177)
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
-- TOC entry 233 (class 1259 OID 21191)
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
    updated_at timestamp(3) without time zone NOT NULL,
    email_verification_token character varying(255),
    is_email_verified boolean DEFAULT false NOT NULL,
    reset_password_expires timestamp(6) with time zone,
    reset_password_token character varying(255)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 21206)
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
-- TOC entry 235 (class 1259 OID 21222)
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
-- TOC entry 236 (class 1259 OID 21235)
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
-- TOC entry 237 (class 1259 OID 21262)
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
-- TOC entry 238 (class 1259 OID 21280)
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
-- TOC entry 239 (class 1259 OID 21301)
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
-- TOC entry 240 (class 1259 OID 21332)
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
-- TOC entry 241 (class 1259 OID 21351)
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
-- TOC entry 242 (class 1259 OID 21368)
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    product_id text NOT NULL,
    category_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 21377)
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
-- TOC entry 244 (class 1259 OID 21391)
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
-- TOC entry 245 (class 1259 OID 21406)
-- Name: product_option_values_on_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option_values_on_products (
    product_id text NOT NULL,
    option_id text NOT NULL,
    value_id text NOT NULL
);


ALTER TABLE public.product_option_values_on_products OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 21414)
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
-- TOC entry 247 (class 1259 OID 21427)
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
-- TOC entry 248 (class 1259 OID 21438)
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
-- TOC entry 249 (class 1259 OID 21456)
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
-- TOC entry 250 (class 1259 OID 21476)
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
-- TOC entry 251 (class 1259 OID 21486)
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
-- TOC entry 252 (class 1259 OID 21501)
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
-- TOC entry 253 (class 1259 OID 21508)
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
-- TOC entry 254 (class 1259 OID 21536)
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
-- TOC entry 255 (class 1259 OID 21549)
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
-- TOC entry 256 (class 1259 OID 21571)
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
-- TOC entry 257 (class 1259 OID 21589)
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
-- TOC entry 258 (class 1259 OID 21604)
-- Name: storefront_filter_tree_nodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storefront_filter_tree_nodes (
    id uuid NOT NULL,
    filter_id uuid NOT NULL,
    parent_id uuid,
    nav_link_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.storefront_filter_tree_nodes OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 21616)
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
-- TOC entry 260 (class 1259 OID 21630)
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
-- TOC entry 261 (class 1259 OID 21652)
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
-- TOC entry 262 (class 1259 OID 21660)
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
-- TOC entry 263 (class 1259 OID 21673)
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
-- TOC entry 264 (class 1259 OID 21691)
-- Name: variant_option_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variant_option_values (
    variant_id text NOT NULL,
    option_id text NOT NULL,
    value_id text NOT NULL
);


ALTER TABLE public.variant_option_values OWNER TO postgres;

--
-- TOC entry 5495 (class 0 OID 21016)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2f5e8ab8-8df8-42ca-ac94-dfd319a32b57	561b2137465cd34c6501660d21ced3ea26bd3f77bf009360ed6db53318bead96	\N	20250308000000_add_customer_password_hash	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250308000000_add_customer_password_hash\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "customers" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"customers\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(639), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250308000000_add_customer_password_hash"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250308000000_add_customer_password_hash"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260	\N	2026-05-04 11:22:21.031256+05	0
\.


--
-- TOC entry 5496 (class 0 OID 21028)
-- Dependencies: 220
-- Data for Name: account_creation_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_creation_tokens (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5497 (class 0 OID 21039)
-- Dependencies: 221
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions (id, key, description, created_at) FROM stdin;
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
6a942717-6026-44e7-80e7-26858f8c3eb5	payments.manage	Manage payment configuration	2026-05-11 11:57:44.154
a629f498-ffea-40d3-b191-bb736eb424cf	cms.manage	Manage CMS pages, blocks, and sliders	2026-05-06 11:10:43.51
664eb436-11ef-46e0-975d-9b30e7f6a127	subscriptions.manage	View storefront email subscriptions (subscriber list)	2026-05-12 07:40:14.805
ccaa881a-2690-41ec-aec9-c061f97c9b7d	reports.read	Access reports and exports	2026-05-04 07:22:01.072
29f643ad-529b-4b68-9932-1828b89c8fa1	settings.manage	Platform settings	2026-05-04 07:22:01.074
\.


--
-- TOC entry 5498 (class 0 OID 21048)
-- Dependencies: 222
-- Data for Name: admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_role_permissions (role_id, permission_id) FROM stdin;
5dc16cb3-f12c-4195-9c85-90563c17d927	7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583
36d65b9f-5927-487b-be37-943b03c16541	d8693266-66d8-4df3-964f-3b3c854155b9
36d65b9f-5927-487b-be37-943b03c16541	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
36d65b9f-5927-487b-be37-943b03c16541	cf811019-a242-4070-851b-3fbb11e88898
36d65b9f-5927-487b-be37-943b03c16541	669ddf50-cf30-4822-8de0-96a7b2192a72
36d65b9f-5927-487b-be37-943b03c16541	0adebdc6-0b0d-4dda-b217-5de5f3b5ed26
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
926550ee-84bb-414a-99f6-e11673f3da0e	6a942717-6026-44e7-80e7-26858f8c3eb5
926550ee-84bb-414a-99f6-e11673f3da0e	a629f498-ffea-40d3-b191-bb736eb424cf
926550ee-84bb-414a-99f6-e11673f3da0e	664eb436-11ef-46e0-975d-9b30e7f6a127
926550ee-84bb-414a-99f6-e11673f3da0e	ccaa881a-2690-41ec-aec9-c061f97c9b7d
926550ee-84bb-414a-99f6-e11673f3da0e	29f643ad-529b-4b68-9932-1828b89c8fa1
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
e4d44e14-47e2-4632-8c43-1ee84cd85eca	6a942717-6026-44e7-80e7-26858f8c3eb5
e4d44e14-47e2-4632-8c43-1ee84cd85eca	a629f498-ffea-40d3-b191-bb736eb424cf
e4d44e14-47e2-4632-8c43-1ee84cd85eca	664eb436-11ef-46e0-975d-9b30e7f6a127
e4d44e14-47e2-4632-8c43-1ee84cd85eca	ccaa881a-2690-41ec-aec9-c061f97c9b7d
f72b62cb-1ae0-4ba2-b178-12539e326c14	bd93314d-9f7e-4048-b578-e518247f01b0
f72b62cb-1ae0-4ba2-b178-12539e326c14	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
f72b62cb-1ae0-4ba2-b178-12539e326c14	2c5b5e04-816b-4864-bf47-d7eff12f79d4
f72b62cb-1ae0-4ba2-b178-12539e326c14	ea11fbc5-c6c8-43c6-b013-66cebc87beba
f72b62cb-1ae0-4ba2-b178-12539e326c14	4ade7771-a344-4bcb-a7ee-4f079430104e
f72b62cb-1ae0-4ba2-b178-12539e326c14	ccaa881a-2690-41ec-aec9-c061f97c9b7d
\.


--
-- TOC entry 5499 (class 0 OID 21053)
-- Dependencies: 223
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_roles (id, slug, name, description, is_system, created_at, updated_at) FROM stdin;
5dc16cb3-f12c-4195-9c85-90563c17d927	inventory-management	inventory management	update & manage inventory	f	2026-05-11 09:40:56.034	2026-05-11 09:40:56.034
36d65b9f-5927-487b-be37-943b03c16541	products-management	products management	update and manage all products	f	2026-05-11 12:02:41.329	2026-05-11 12:02:41.329
926550ee-84bb-414a-99f6-e11673f3da0e	super-admin	Super Admin	Full platform access. Assign sparingly.	t	2026-05-04 07:22:01.076	2026-06-22 08:55:57.848
e4d44e14-47e2-4632-8c43-1ee84cd85eca	manager	Operations Manager	Day-to-day commerce operations without user/role administration.	t	2026-05-12 07:03:29.765	2026-06-22 08:55:57.85
f72b62cb-1ae0-4ba2-b178-12539e326c14	support	Support	Read-heavy access for customer service.	t	2026-05-12 07:03:29.768	2026-06-22 08:55:57.851
\.


--
-- TOC entry 5500 (class 0 OID 21066)
-- Dependencies: 224
-- Data for Name: admin_user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_user_roles (user_id, role_id) FROM stdin;
f4b18155-4045-41e5-8bfc-c9371013bbd3	926550ee-84bb-414a-99f6-e11673f3da0e
20dd43d6-e741-4256-bf8d-8fef76fb7c47	926550ee-84bb-414a-99f6-e11673f3da0e
f2579ef9-ed54-4bcc-a685-61f049bf38a0	5dc16cb3-f12c-4195-9c85-90563c17d927
1988f799-1a91-49d9-8322-36d857c54915	36d65b9f-5927-487b-be37-943b03c16541
\.


--
-- TOC entry 5501 (class 0 OID 21071)
-- Dependencies: 225
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, password_hash, first_name, last_name, is_active, last_login_at, created_at, updated_at) FROM stdin;
1988f799-1a91-49d9-8322-36d857c54915	products@admin.com	$2b$10$VNC/Tyfa5JH/FI7DcGmwou5P0HlaXmZ3KA0T9dnAf8rQqhpeOdl3y	products	management	t	2026-05-11 17:03:42.621+05	2026-05-11 12:03:18.182	2026-05-11 12:03:42.624
f2579ef9-ed54-4bcc-a685-61f049bf38a0	dummy@admin.com	$2b$10$I6FYLJt9Vs/JS0nK4iSX6eSV2UY5jpweG1kkFuWqxRoAy..ij18My	inventory	manager	t	2026-05-12 10:53:22.532+05	2026-05-11 09:41:54.067	2026-05-12 05:53:22.533
20dd43d6-e741-4256-bf8d-8fef76fb7c47	a.wahab445@gmail.com	$2b$10$aYlaY6PZ6o.AKWYdUr775uZW9A0bfkp0mka65ej/BomKZsZmLkwei	abdul	wahab	t	2026-06-13 21:10:39.305+05	2026-05-11 09:21:52.545	2026-06-13 16:10:39.306
f4b18155-4045-41e5-8bfc-c9371013bbd3	huzaifa@admin.com	$2b$10$b9eBNs4skCrh/Fy/70wta.64I6Z1w60vXENXBSnCf2qNEACEuoG2u	Super	Admin	t	2026-06-19 18:52:31.655+05	2026-05-04 07:22:01.201	2026-06-19 13:52:31.666
\.


--
-- TOC entry 5502 (class 0 OID 21084)
-- Dependencies: 226
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, parent_id, "position", is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5503 (class 0 OID 21099)
-- Dependencies: 227
-- Data for Name: cms_banner_sliders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_sliders (id, name, identifier, is_active, autoplay_ms, created_at, updated_at, slide_height_px, slide_width_px) FROM stdin;
1bf78196-8e5c-416b-b0f4-e70a8396b3f4	Home Hero Slider	home-hero	t	5000	2026-05-06 11:10:43.589	2026-06-17 07:03:52.182	800	1920
\.


--
-- TOC entry 5504 (class 0 OID 21112)
-- Dependencies: 228
-- Data for Name: cms_banner_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_slides (id, slider_id, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active, created_at, updated_at) FROM stdin;
e357bf3e-7830-41b6-9786-b777f7354b4a	1bf78196-8e5c-416b-b0f4-e70a8396b3f4	Shop smarter with confidence	Curated essentials at fair prices.	http://localhost:3000/uploads/cms-slides/7610248f-bd0d-466d-9814-6bbab495d269.png	Shop now	/products	0	t	2026-06-17 07:03:52.182	2026-06-17 07:03:52.182
a3266cb3-1ebf-4410-a5f0-28b810b2603e	1bf78196-8e5c-416b-b0f4-e70a8396b3f4	Track your orders anytime	Real-time updates from checkout to delivery.	http://localhost:3000/uploads/cms-slides/46daff2d-8a55-42dd-8d12-0ea45f3b5a0f.png	Track order	/track-order	1	t	2026-06-17 07:03:52.182	2026-06-17 07:03:52.182
\.


--
-- TOC entry 5505 (class 0 OID 21128)
-- Dependencies: 229
-- Data for Name: cms_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_blocks (id, name, identifier, description, content_html, content_json, is_active, created_at, updated_at) FROM stdin;
f0a06619-77d8-4341-be1c-5264e7b2114d	Home page lay out1	home-page-layout1	test run	Home page layout JSON block.	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "test run ", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "blocks test run."}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}]}	t	2026-05-09 11:00:52.585	2026-05-09 11:13:53.205
b1666ef1-3569-4837-bcc7-60da6b3e5aca	Home inline teaser	home-inline-teaser	Example block embedded in homepage layout by identifier	<div class="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"><h2 class="text-lg font-semibold text-foreground">Managed as its own block</h2><p class="mt-2 text-sm text-muted-foreground">This copy lives in the <strong>home-inline-teaser</strong> CMS block. The home layout references it by identifier so you can edit it separately from the layout JSON.</p></div>	{}	t	2026-05-09 15:06:31.808	2026-05-15 05:42:35.245
5fd1a7da-ae28-4ea8-abeb-b3cbfca36dc3	Home Page Layout	home-page-layout	Structured sections consumed by storefront homepage	<p>Home page layout JSON block.</p>	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "Members save more", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "Create your account for exclusive offers."}, {"id": "inline-teaser", "type": "cms_block_ref", "blockIdentifier": "home-inline-teaser"}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}, {"id": "subscription", "type": "subscription_cta", "title": "Stay in the loop", "subtitle": "Get product drops and offers by email."}]}	t	2026-05-06 11:10:43.581	2026-05-15 05:42:35.248
\.


--
-- TOC entry 5506 (class 0 OID 21142)
-- Dependencies: 230
-- Data for Name: cms_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_pages (id, title, slug, status, excerpt, meta_title, meta_description, content_html, content_json, published_at, created_at, updated_at) FROM stdin;
55e2338a-d4d9-4dd9-96dd-f2c9a3d28fd8	Feedback	feed-back	published	give us your feedback	feedback	give us your feedback	<span style="color:rgb(0, 0, 0);font-family:ui-sans-serif, system-ui, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;;font-size:16px;background-color:rgb(250, 250, 249)"><b><i>We value your feedback and are committed to providing the best service possible.</i></b></span>	{}	2026-06-13 16:11:44.645	2026-05-09 12:46:43.074	2026-06-13 16:11:44.646
91a59ded-c6f8-48ad-8ad7-4710ce375b97	About Us	about-us	published	Learn more about our mission and team.	About Us	About our ecommerce store and what we stand for.	<h1>About Us</h1><p>We are building a modern ecommerce experience with trusted products and reliable delivery.</p><p>Our mission is simple: quality, transparency, and customer-first service.</p>	{}	2026-06-13 16:11:48.549	2026-05-06 11:10:43.576	2026-06-13 16:11:48.551
\.


--
-- TOC entry 5507 (class 0 OID 21156)
-- Dependencies: 231
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_addresses (id, customer_id, label, first_name, last_name, company, address_line1, address_line2, city, state, postal_code, country, phone, is_default_billing, is_default_shipping, created_at, updated_at) FROM stdin;
af19751a-b0d7-4e71-9bbe-5c134bc191a2	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	HOME A	SYED	HUZAIFA		SAEEDABAD		KARACHI	SINDH	74760	PK		t	t	2026-05-04 07:06:40.368	2026-05-04 07:06:43.125
\.


--
-- TOC entry 5508 (class 0 OID 21177)
-- Dependencies: 232
-- Data for Name: customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_groups (id, name, description, is_default, tax_class_id, discount_percent, metadata, created_at, updated_at) FROM stdin;
8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	default	Default customers	t	\N	10.00	{}	2026-05-04 06:53:26.01	2026-05-04 06:57:43.567
\.


--
-- TOC entry 5509 (class 0 OID 21191)
-- Dependencies: 233
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, email, password_hash, first_name, last_name, phone, is_guest, customer_group_id, metadata, created_at, updated_at, email_verification_token, is_email_verified, reset_password_expires, reset_password_token) FROM stdin;
8fbf3a74-9fd8-43db-8858-a0ec225cdb10	a.wahab445@gmail.com	\N	\N	\N	\N	t	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-06-13 13:35:13.696	2026-06-13 13:35:13.696	\N	f	\N	\N
9edfe779-d5f5-45c4-8271-cd23126ae215	guest+b89cb48f-a650-4039-9df4-22b45446512a@checkout.local	\N	\N	\N	\N	t	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-06-19 06:57:03.274	2026-06-19 06:57:03.274	\N	f	\N	\N
2ce172d7-3bfd-4d9e-9e1a-421d5618b6cc	huzaifawork525@gmaiil.com	$2b$10$aP/SXl2w2/b16wwKKeR3COFK95j0Oa8RMjGHySlMb3AhL4vTZYzpS	syed	huzaifa	123456789	f	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-06-22 07:36:39.501	2026-06-22 07:36:39.501	a9f3c7fcedafe3cf12c783fb6b1ecad8c484f0986b0f891c3d448bf107e99514	f	\N	\N
9af9973d-5564-4d72-bc32-24f34389cd3b	o4cef@web-library.net	$2b$10$HhKlssQneC0ecaLu8Wwyvu7Wta9N9IDyDkGlCpOr2kPZ8EfD8Y5fu	syed	huzaifa	123456789	f	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-06-22 07:42:24.648	2026-06-22 07:42:24.648	d3918292fd65bd891051db87447489452738b7752a6ec3142cde59606e3f595e	f	\N	\N
88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	smhuzaifa525@gmail.com	$2b$10$L4RveIaJHOLoXdjCSd03LeXg910rbT0siH0QnWR0tE2A7Zfvt6xom	syed	huzaifa	+92 332 2272592	f	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-05-04 06:58:33.211	2026-06-22 08:12:47.685	\N	f	\N	\N
d52a8862-ec38-4fba-adb6-3a6646cafddb	contentdigital21@gmail.com	$2b$10$joLEM/xXqwLbOdz10Q.DJeQP5MOat5z.7i.a.6WQZFbcbrcTUiMY.	digital	content	\N	f	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-06-22 08:41:21.534	2026-06-22 08:42:47.551	\N	t	\N	\N
\.


--
-- TOC entry 5510 (class 0 OID 21206)
-- Dependencies: 234
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, product_id, variant_id, warehouse_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, updated_at) FROM stdin;
d9d76782-cbfc-42e9-932a-e2d102a1a02e	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	default-warehouse	100	0	100	10	2026-05-04 07:01:30.851
b090fcda-7fd0-491f-a568-eb88e441fdd6	64289463-e48b-4261-bfef-e59b622eb20e	\N	default-warehouse	99	14	85	10	2026-05-07 11:45:56.203
c2dcd150-bdf3-494e-ba63-257e03c8fae1	df541ce1-98b2-49a0-8479-f5a9e1532a85	120f37f1-42aa-45c0-b801-4731330886e3	default-warehouse	100	1	99	10	2026-06-19 10:59:14.279
8ecbf34f-6e3c-4a54-865c-96b2cfd61db3	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	default-warehouse	100	2	98	10	2026-05-07 06:55:48.037
caf29d2a-ac95-41a5-a473-731481b1993f	0019bc5a-cfda-423a-8033-04e19527878c	\N	default-warehouse	100	1	99	10	2026-05-08 05:31:15.452
ea788ec2-ac8c-4bfa-b715-8dfba2435a10	90792798-2b85-4423-8eba-e7f12c64617d	dab15350-43b5-4b34-b7b5-19109578dfb6	default-warehouse	99	0	99	10	2026-06-19 12:12:24.519
a5ca3c26-9814-4692-853b-b13bef9e1ef4	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	default-warehouse	100	0	100	10	2026-06-19 11:48:10.794
e322b788-8aee-44ed-94a2-6687d259450e	64289463-e48b-4261-bfef-e59b622eb20e	44336f06-9b4d-4dd5-a651-c707a9bbc34a	default-warehouse	100	0	100	10	2026-06-19 08:13:28.445
eb37c3e5-a5e0-4d2c-b452-0d5965da990e	64289463-e48b-4261-bfef-e59b622eb20e	d1c1d523-51e8-43c4-a7cc-b8028c68a645	default-warehouse	100	0	100	10	2026-06-19 08:13:28.45
7ed6d005-7caf-4386-96b5-22242e6900a1	64289463-e48b-4261-bfef-e59b622eb20e	698b25db-dba8-4445-904d-42c73dccab7c	default-warehouse	100	0	100	10	2026-06-19 08:18:18.216
48d70064-02da-47a4-a24b-3842419350d1	eaacdf54-eaa9-4dcc-839e-a10a61588523	f44c87d3-ea38-4329-bad9-b0a72e4d955d	default-warehouse	100	0	100	10	2026-06-19 08:26:04.28
eb4df3ab-56b6-4d47-b063-f96977b1e3df	eaacdf54-eaa9-4dcc-839e-a10a61588523	76e0bd60-36da-44ae-bff0-dd87635ce982	default-warehouse	100	0	100	10	2026-06-19 08:26:04.294
de230c85-428b-4443-aea2-0cff949af90d	eaacdf54-eaa9-4dcc-839e-a10a61588523	ec4803c2-6aa6-452c-aa1a-e23d0271d115	default-warehouse	100	0	100	10	2026-06-19 08:26:04.299
d450eb12-9a89-4c8b-a976-be078712457a	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	85511305-b97c-4697-9e60-1ebb4ef4e0de	default-warehouse	100	0	100	10	2026-06-19 08:26:21.062
0a4aa0ef-7ca5-411c-a43c-c490d1d47955	eb72e342-64df-4566-8029-db2c63859130	c36c179e-c2af-4e00-beea-dfd8a3cdec2c	default-warehouse	100	0	100	10	2026-06-19 08:26:46.245
c77665cb-bfb9-4f9e-b6bf-5fa923f8abe5	09cfaa0d-9088-4e2d-823e-3ad80af8853b	480fc5fd-9198-4c2f-ae38-8a0b052a9313	default-warehouse	99	0	99	10	2026-06-19 12:39:21.801
4bb64e24-e1d4-4fdb-a55c-d9294878bae1	eb72e342-64df-4566-8029-db2c63859130	663e25b8-ac9e-4892-b47c-c2e9514ef716	default-warehouse	100	0	100	10	2026-06-19 08:26:50.464
ed00912f-f66e-422b-83d5-f881e8a5ac71	5eaf65df-0faa-4975-be7b-6a2554a04f13	b85f7fa3-cb5b-4754-8399-6f792a3bf635	default-warehouse	100	0	100	10	2026-06-19 08:27:08.545
31ed8490-3c95-4f4a-b6e3-5e4a8677ea22	b4366645-b14a-4de1-b621-e8776dc4f689	cd8e05c4-96f5-488b-aa34-74083d3e2978	default-warehouse	100	0	100	10	2026-06-19 08:27:48.992
1a6785e7-8938-48eb-82a9-987fa57ca3d5	b4366645-b14a-4de1-b621-e8776dc4f689	ad533fd1-8637-4268-bf5c-c8dcd1febdc6	default-warehouse	100	0	100	10	2026-06-19 08:27:48.998
4ec3b6cd-0c6e-44df-8f6f-08fd72684f89	b4366645-b14a-4de1-b621-e8776dc4f689	34eddf36-827a-4247-9037-4af9dae3a462	default-warehouse	100	0	100	10	2026-06-19 08:27:49.003
ca660625-6581-47a8-95ca-0c1d1fb3be9e	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	81b62a2b-ca50-48c2-8ee7-3628ab91a7a1	default-warehouse	100	0	100	10	2026-06-17 14:00:14.427
e57f5c78-ac0b-492e-9bdd-67d63a88d044	0019bc5a-cfda-423a-8033-04e19527878c	58daf9a0-a0ab-4273-b449-e6a076fc9acc	default-warehouse	300	0	300	10	2026-06-17 14:01:00.946
04e61e53-0d37-4e81-b2c6-827f8eb098b6	b4366645-b14a-4de1-b621-e8776dc4f689	3fcd3a63-0d69-4368-8078-4094c1f0d595	default-warehouse	100	0	100	10	2026-06-19 08:27:49.008
4dcef264-f20d-4ed8-8e10-2f1669d1df37	2e6248be-15bb-45a8-8dc1-245118193c6f	5c75a449-39e0-4ec7-a6ff-d11dbb9f2d08	default-warehouse	100	0	100	10	2026-06-17 14:03:50.547
82faa21f-b032-4dfa-a325-65ec02dd9035	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	default-warehouse	99	1	98	10	2026-06-22 07:35:45.905
a036ecf0-ad5c-4e75-8d9f-9496a6fb9c7b	11920e18-2c21-473c-a201-54cfa6870a03	a0f519b2-b535-41bb-abae-c7bf57b39e4c	default-warehouse	100	0	100	10	2026-06-17 14:04:43.477
da03eeb2-7a69-453b-ac43-d7ccf312e55d	eb72e342-64df-4566-8029-db2c63859130	fdf241e4-b0d0-456e-8da6-eef5c1124666	default-warehouse	100	0	100	10	2026-06-17 14:04:56.239
4b2afae4-8cbd-46ee-b38a-2b1a653ccf06	72c84214-a05b-40e8-9093-d76177afd8d9	80c8d8b5-ebed-42d3-aca4-9611d4585f71	default-warehouse	100	0	100	10	2026-06-17 14:05:07.474
36ae4515-34fd-4626-abbc-67038eb0fd50	230f5c47-5d61-4da1-adfc-6aa5d46f7111	b0d59239-7b73-492b-8cf8-d0ddba9b5d2e	default-warehouse	100	0	100	10	2026-06-17 14:05:30.854
c53e3755-c61f-4843-9307-5374e5991fd2	1f87d70a-7fb5-43e9-a41c-87b29873a33b	f48488c2-d01c-47a1-98f2-8073d9f103db	default-warehouse	100	1	99	10	2026-06-19 08:28:54.962
5ba9dfcb-be6f-4ee6-bef5-677669be5bb6	1f87d70a-7fb5-43e9-a41c-87b29873a33b	3ddee9a7-cbf0-4ce6-9f0a-1b71cf16d076	default-warehouse	100	0	100	10	2026-06-19 08:28:54.968
5e5c6e02-c8c3-4ba6-a63d-73caae2086b5	2881ef70-d26b-4da5-af06-9e0c5795fee4	4e7ea113-5c3c-4315-96f5-357735682caa	default-warehouse	100	0	100	10	2026-06-17 14:07:06.017
38352b5d-e67e-4109-9e8c-a8b195bd96fd	07b2bf6a-2585-42f2-a7fd-ecc432b11861	efbf85a4-a7b1-4ead-83db-4c7df04e3790	default-warehouse	99	1	98	10	2026-06-22 09:00:05.248
f0586044-dd40-4ed1-a302-34bf601e6856	05268a8c-518a-4ff4-8691-3cfdff054382	e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	default-warehouse	100	0	100	10	2026-06-19 10:20:35.987
0d5ab22a-ee34-4566-8176-edd3dbedc9e8	64289463-e48b-4261-bfef-e59b622eb20e	9de378fb-d5bc-4d5b-bf8a-5e1f10318aa1	default-warehouse	100	0	100	10	2026-06-19 11:46:28.963
2a386754-a5c0-4e89-8d76-7c313c3080b3	64289463-e48b-4261-bfef-e59b622eb20e	c040a4a6-e6c4-42dd-b718-a0f40b02badc	default-warehouse	100	0	100	10	2026-06-19 08:13:28.44
1a64514b-c590-4af2-855f-c35f45bef732	64289463-e48b-4261-bfef-e59b622eb20e	733b396a-9b08-4190-b3c4-5ab6ee899cac	default-warehouse	100	0	100	10	2026-06-19 11:46:28.955
18241280-57bf-4f99-aaef-9df4ec83de3b	64289463-e48b-4261-bfef-e59b622eb20e	77cde620-dc5a-4d4b-9248-26b8b31ad58a	default-warehouse	100	0	100	10	2026-06-19 08:13:28.46
3d151808-d059-48d4-a7db-78c0f1f32f6e	64289463-e48b-4261-bfef-e59b622eb20e	24501ee4-c6e2-4123-927b-6cf3566f0acf	default-warehouse	100	0	100	10	2026-06-19 08:13:28.435
c58439e0-ad7b-4047-8c4b-7d19e4fed0ee	64289463-e48b-4261-bfef-e59b622eb20e	cc51d3af-bbfc-420d-8122-96c69eba6b3a	default-warehouse	100	0	100	10	2026-06-19 08:13:28.475
f1a10a5f-1005-4d34-954d-60ccb5222c12	64289463-e48b-4261-bfef-e59b622eb20e	531d2a81-91cf-4868-bc07-9319aca112fd	default-warehouse	100	0	100	10	2026-06-19 08:13:28.465
\.


--
-- TOC entry 5511 (class 0 OID 21222)
-- Dependencies: 235
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
c2015257-7e02-4df7-ad19-306692e3b2c5	c53e3755-c61f-4843-9307-5374e5991fd2	cart	08718290-6c00-473f-9ea1-6f9bbff2ae0e	1	2026-06-18 08:59:36.344	2026-06-18 08:29:36.345
f836d98f-6b9f-4a56-bb20-f2806b0c3cd6	38352b5d-e67e-4109-9e8c-a8b195bd96fd	cart	471aec42-40a1-467b-b8e5-eb30c00b85b7	1	2026-06-18 09:49:44.229	2026-06-18 09:19:44.233
a815a10f-bc45-4700-ab1e-1ad92e20ecac	82faa21f-b032-4dfa-a325-65ec02dd9035	cart	33a886be-7a65-4890-b15f-0bd2f437bfa2	1	2026-06-19 07:08:14.934	2026-06-19 06:38:14.938
2e06fd19-8e64-430a-8ec8-a4eca92f7c4a	c2dcd150-bdf3-494e-ba63-257e03c8fae1	cart	d07f3235-48ac-4fc3-bfb8-91102f4a34ea	1	2026-06-19 07:36:11.775	2026-06-19 07:06:11.851
\.


--
-- TOC entry 5512 (class 0 OID 21235)
-- Dependencies: 236
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, variant_id, sku, name, attributes, quantity, unit_price, discount_amount, tax_amount, row_total, quantity_fulfilled, quantity_refunded, metadata, created_at) FROM stdin;
21a18e0b-5bed-4136-ac04-678408542837	4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	64289463-e48b-4261-bfef-e59b622eb20e	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004	Test Product	{}	1	32.87	0.00	0.00	32.87	0	0	{}	2026-05-04 07:33:33.36
8b64f088-d410-4ed8-a491-c2c79b21e28f	0aaf74b5-f65e-4019-9d3e-fbc88d4b2238	64289463-e48b-4261-bfef-e59b622eb20e	40973815-351e-42b2-99dc-e30539f21968	SKU-004-VANILA-1KG	Flavour: Vanila • Weight: 1kg	{"optionValues": {"weight": "1kg", "flavour": "Vanila"}, "optionValueIds": {"weight": "e86955c2-ebde-4ba0-9925-743eb1a2371e", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	1	999.00	0.00	0.00	999.00	0	0	{}	2026-06-13 13:35:13.821
48bccc19-cf33-4dbf-8c21-28d6c7a520f3	5bbb30ed-34a8-41d2-9d5b-da4510ff51bd	64289463-e48b-4261-bfef-e59b622eb20e	40973815-351e-42b2-99dc-e30539f21968	SKU-004-VANILA-1KG	Flavour: Vanila • Weight: 1kg	{"optionValues": {"weight": "1kg", "flavour": "Vanila"}, "optionValueIds": {"weight": "e86955c2-ebde-4ba0-9925-743eb1a2371e", "flavour": "c1ed8248-fa5f-4ed8-9b60-0534ee9cbfc4"}}	1	999.00	0.00	0.00	999.00	0	0	{}	2026-06-13 13:35:46.826
fd02c613-1dcb-4e96-a1f8-e803e7d8b12e	ed2aa604-ab97-46f0-b68d-e3adc79d8208	07b2bf6a-2585-42f2-a7fd-ecc432b11861	efbf85a4-a7b1-4ead-83db-4c7df04e3790	SKU-015-1PCS	Pack: 1Pcs	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	100.00	0.00	0.00	100.00	0	0	{}	2026-06-18 07:58:09.323
788cb797-611e-4e50-b9b5-3c8221d21d7b	4c768e17-67dc-4338-954f-579e75b349e5	05268a8c-518a-4ff4-8691-3cfdff054382	e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	SKU-021-1PCS	Pack: 1Pcs	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	50.00	0.00	0.00	50.00	0	0	{}	2026-06-18 08:09:20.864
40c380a4-3d77-4224-b89e-76f1302b8193	654b6efd-d07f-4807-a203-919a9e285841	05268a8c-518a-4ff4-8691-3cfdff054382	e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	SKU-021-1PCS	Pack: 1Pcs	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	98	50.00	0.00	0.00	4900.00	0	0	{}	2026-06-18 08:21:55.29
f8fbb507-bd57-4da9-8309-18ac65499229	6c504841-7bb6-45f0-bf1a-58fda35f2000	90792798-2b85-4423-8eba-e7f12c64617d	dac44db9-52fe-47ef-bec9-80ebd2773cba	SKU-020-1PCS	Pack: 1Pcs	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	10.00	0.00	0.00	10.00	0	0	{}	2026-06-18 08:23:36.138
5ed75898-6c55-42b6-b206-32201623a691	b57f8179-1e64-4504-9e63-74e0aff73c27	90792798-2b85-4423-8eba-e7f12c64617d	dac44db9-52fe-47ef-bec9-80ebd2773cba	SKU-020-1PCS	Pack: 1Pcs	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	10.00	0.00	0.00	10.00	0	0	{}	2026-06-18 08:44:50.292
d3322e01-6728-4365-bc80-720e84614d53	b65a1ffc-c717-42f5-a104-066d8fd6dd12	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	SKU-014-1BOTTLE	Pack: 1Bottle	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	100.00	0.00	0.00	100.00	0	0	{}	2026-06-18 09:09:03.079
82ba322e-09c3-4c35-bf2d-74e8da160a68	bc071ff0-87c0-484a-93a4-286961c91d20	5eaf65df-0faa-4975-be7b-6a2554a04f13	b85f7fa3-cb5b-4754-8399-6f792a3bf635	SKU-010-1-5LTR	Tile Wash	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	1	80.00	0.00	0.00	80.00	0	0	{"productName": "Tile Wash", "productImage": "http://localhost:3000/uploads/products/e2efe486-c41b-4700-879c-f2debc87b3fd.jpeg", "variantLabel": "Weight: 1.5Ltr"}	2026-06-18 09:27:40.29
004c2dd0-795b-4dfb-9cb3-6f364354d333	51ec8a89-eff9-49d9-964e-5420a013ea3b	df541ce1-98b2-49a0-8479-f5a9e1532a85	120f37f1-42aa-45c0-b801-4731330886e3	SKU-012-1BOTTLE	Glass Cleaner (Clean 360)	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	200.00	0.00	0.00	200.00	0	0	{"productName": "Glass Cleaner (Clean 360)", "productImage": "http://localhost:3000/uploads/products/f1d3659c-e8a6-4841-b2ba-16dcad409431.jpeg", "variantLabel": "Pack: 1Bottle"}	2026-06-18 09:41:10.485
eaf1cfed-c179-4507-8a3b-c930618d1786	cb80ad0a-2a4f-40e7-a4ac-f3bfbd007b1a	09cfaa0d-9088-4e2d-823e-3ad80af8853b	480fc5fd-9198-4c2f-ae38-8a0b052a9313	SKU-017-2LTR	Sweep-o Floor & Tile Cleaner	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	1	159.00	0.00	0.00	159.00	0	0	{"productName": "Sweep-o Floor & Tile Cleaner", "productImage": "http://localhost:3000/uploads/products/0c2e39fe-26c3-416f-8cd0-72747aa624be.jpeg", "variantLabel": "Weight: 2Ltr"}	2026-06-18 09:42:40.827
c38f3021-85a9-4cda-9b78-9c78a3e21194	d3559801-23d2-4547-8f47-153a81fd2451	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	SKU-014-1BOTTLE	Panda Liquid Neel	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	100.00	0.00	0.00	100.00	0	0	{"productName": "Panda Liquid Neel", "productImage": "http://localhost:3000/uploads/products/66da266a-d52b-46da-a138-77ad84696bef.jpeg", "variantLabel": "Pack: 1Bottle"}	2026-06-18 09:49:44.552
73d17daa-8b1f-41e9-ae12-e76ccca98a7c	fc750368-9e2b-4ff9-a64d-fb1693c0b1c9	b4366645-b14a-4de1-b621-e8776dc4f689	cd8e05c4-96f5-488b-aa34-74083d3e2978	SKU-013-ROSE-3LTR	Panda Perfume Phenyl	{"optionValues": {"weight": "3Ltr", "flavour": "Rose"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	1	370.00	0.00	0.00	370.00	0	0	{"productName": "Panda Perfume Phenyl", "productImage": "http://localhost:3000/uploads/products/85d40ec1-22b4-41b3-b485-ce02a3f10a7b.jpeg", "variantLabel": "Flavour: Rose • Weight: 3Ltr"}	2026-06-18 12:38:28.752
9f9baafe-fff1-4d68-8d73-431473c782f4	dfba12bc-f5ab-4c8e-9f3c-9feecc6a2bae	90792798-2b85-4423-8eba-e7f12c64617d	dac44db9-52fe-47ef-bec9-80ebd2773cba	SKU-020-1PCS	777 Sony Dish Wash Soap	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	10.00	0.00	0.00	10.00	0	0	{"productName": "777 Sony Dish Wash Soap", "productImage": "http://localhost:3000/uploads/products/451ccb4f-99dc-408c-bd90-f5d75263afdf.jpeg", "variantLabel": "Pack: 1Pcs"}	2026-06-19 06:57:03.373
ea8a194f-0b48-4a64-9182-5640bf2ac4f1	701297c8-2e33-4fc7-a618-d181d864d6fa	b4366645-b14a-4de1-b621-e8776dc4f689	cd8e05c4-96f5-488b-aa34-74083d3e2978	SKU-013-ROSE-3LTR	Panda Perfume Phenyl	{"optionValues": {"weight": "3Ltr", "flavour": "Rose"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	1	370.00	0.00	0.00	370.00	0	0	{"productName": "Panda Perfume Phenyl", "productImage": "http://localhost:3000/uploads/products/85d40ec1-22b4-41b3-b485-ce02a3f10a7b.jpeg", "variantLabel": "Flavour: Rose • Weight: 3Ltr"}	2026-06-19 07:19:21.228
7b3e78b7-5832-474c-bee6-8f00ff2a9cee	6d341f68-d4da-4b7f-986b-6b22a3377947	df541ce1-98b2-49a0-8479-f5a9e1532a85	120f37f1-42aa-45c0-b801-4731330886e3	SKU-012-1BOTTLE	Glass Cleaner (Clean 360)	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	200.00	0.00	0.00	200.00	0	0	{"productName": "Glass Cleaner (Clean 360)", "productImage": "http://localhost:3000/uploads/products/f1d3659c-e8a6-4841-b2ba-16dcad409431.jpeg", "variantLabel": "Pack: 1Bottle"}	2026-06-19 10:59:14.241
f6251a91-9654-404c-9b45-6bc870c304a1	fce4769d-051a-4182-a8ee-f013e140c6c9	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	SKU-016-2LTR	Clean360 Bleach Exra Strong	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	1	180.00	0.00	0.00	180.00	0	0	{"productName": "Clean360 Bleach Exra Strong", "productImage": "http://localhost:3000/uploads/products/8e8d394e-aab0-4c74-8390-41ea4845f784.jpeg", "variantLabel": "Weight: 2Ltr"}	2026-06-19 11:23:13.302
5c6e807c-2d87-4e2e-b4d4-8a8a6266ea84	5b3a844d-5a71-4503-8a0e-83e67e5bd951	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	SKU-014-1BOTTLE	Panda Liquid Neel	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	100.00	0.00	0.00	100.00	0	0	{"productName": "Panda Liquid Neel", "productImage": "http://localhost:3000/uploads/products/66da266a-d52b-46da-a138-77ad84696bef.jpeg", "variantLabel": "Pack: 1Bottle"}	2026-06-19 11:30:32.378
81a3c515-5cab-4f83-bdea-be61aaf2f2fa	3f9b5d6c-f5f6-4ba5-96dc-d42e683a3839	90792798-2b85-4423-8eba-e7f12c64617d	dab15350-43b5-4b34-b7b5-19109578dfb6	SKU-020-1PCS	777 Sony Dish Wash Soap	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	20.00	0.00	0.00	20.00	0	0	{"productName": "777 Sony Dish Wash Soap", "productImage": "http://localhost:3000/uploads/products/451ccb4f-99dc-408c-bd90-f5d75263afdf.jpeg", "variantLabel": "Pack: 1Pcs"}	2026-06-19 12:12:24.443
82792d54-0445-4d04-af7c-2d8f27a7cd17	2b2fec3f-6790-410f-a40a-cb56bb87e12e	09cfaa0d-9088-4e2d-823e-3ad80af8853b	480fc5fd-9198-4c2f-ae38-8a0b052a9313	SKU-017-2LTR	Sweep-o Floor & Tile Cleaner	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	1	159.00	0.00	0.00	159.00	0	0	{"productName": "Sweep-o Floor & Tile Cleaner", "productImage": "http://localhost:3000/uploads/products/0c2e39fe-26c3-416f-8cd0-72747aa624be.jpeg", "variantLabel": "Weight: 2Ltr"}	2026-06-19 12:39:21.758
c270022d-eeed-4467-b5e8-2e079b999b34	4c82e16e-4174-4bdc-a945-f4f335fdc0d5	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	SKU-014-1BOTTLE	Panda Liquid Neel	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	100.00	0.00	0.00	100.00	0	0	{"productName": "Panda Liquid Neel", "productImage": "http://localhost:3000/uploads/products/66da266a-d52b-46da-a138-77ad84696bef.jpeg", "variantLabel": "Pack: 1Bottle"}	2026-06-22 07:35:45.863
5d19d30f-b797-4ccc-a208-40c6688d9c68	a2ef88db-85e1-41f3-b3a1-d8ab6c641dbe	07b2bf6a-2585-42f2-a7fd-ecc432b11861	efbf85a4-a7b1-4ead-83db-4c7df04e3790	SKU-015-1PCS	Cockroach Killer	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	100.00	0.00	0.00	100.00	0	0	{"productName": "Cockroach Killer", "productImage": "http://localhost:3000/uploads/products/251a93d2-b237-4bee-bdb3-07da60c6d035.jpeg", "variantLabel": "Pack: 1Pcs"}	2026-06-22 09:00:05.197
\.


--
-- TOC entry 5513 (class 0 OID 21262)
-- Dependencies: 237
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping (id, order_id, shipping_method_id, cost, currency, status, tracking_number, tracking_url, courier_code, courier_name, shipped_at, delivered_at, cancelled_at, shipping_address, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5514 (class 0 OID 21280)
-- Dependencies: 238
-- Data for Name: order_taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_taxes (id, order_id, tax_id, tax_class_id, tax_class_code, tax_class_name, country, region, rate, is_inclusive, taxable_amount, tax_amount, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5515 (class 0 OID 21301)
-- Dependencies: 239
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, customer_id, customer_group_id, status, payment_status, fulfillment_status, customer_email, customer_name, billing_address, shipping_address, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, applied_price_rules, ip_address, user_agent, notes, metadata, created_at, updated_at, cancelled_at, completed_at) FROM stdin;
4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	ORD-20260504-00001	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "KARACHI", "label": "HOME A", "phone": "", "state": "SINDH", "company": "", "country": "PK", "lastName": "HUZAIFA", "firstName": "SYED", "postalCode": "74760", "addressLine1": "SAEEDABAD", "addressLine2": ""}	{"city": "KARACHI", "label": "HOME A", "phone": "", "state": "SINDH", "company": "", "country": "PK", "lastName": "HUZAIFA", "firstName": "SYED", "postalCode": "74760", "addressLine1": "SAEEDABAD", "addressLine2": ""}	USD	32.87	0.00	0.00	0.00	32.87	[]	\N	\N	\N	{"checkoutId": "55b4c288-998d-49f9-bd4b-ac10fae8f79f", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-05-04 07:33:33.36	2026-05-04 07:33:33.36	\N	\N
0aaf74b5-f65e-4019-9d3e-fbc88d4b2238	ORD-20260613-00001	8fbf3a74-9fd8-43db-8858-a0ec225cdb10	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	a.wahab445@gmail.com	test	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	PKR	999.00	0.00	0.00	0.00	999.00	[]	\N	\N	\N	{"checkoutId": "77b158e9-8973-4b6a-936d-1ce7fed26a40", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-13 13:35:13.821	2026-06-13 13:35:13.821	\N	\N
5bbb30ed-34a8-41d2-9d5b-da4510ff51bd	ORD-20260613-00002	8fbf3a74-9fd8-43db-8858-a0ec225cdb10	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	processing	pending	unfulfilled	a.wahab445@gmail.com	\N	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	PKR	999.00	0.00	0.00	0.00	999.00	[]	\N	\N	\N	{"checkoutId": "6f672239-62af-4d88-acb8-d46d5fae96a6", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-13 13:35:46.826	2026-06-13 13:45:32.357	\N	\N
ed2aa604-ab97-46f0-b68d-e3adc79d8208	ORD-20260618-00001	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	100.00	0.00	0.00	0.00	100.00	[]	\N	\N	\N	{"checkoutId": "44cfe58a-d167-4b32-9dff-f446edceb156", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 07:58:09.323	2026-06-18 07:58:09.323	\N	\N
4c768e17-67dc-4338-954f-579e75b349e5	ORD-20260618-00002	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	50.00	0.00	0.00	0.00	50.00	[]	\N	\N	\N	{"checkoutId": "6a953440-2c02-46b2-888b-07831af3e4b5", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:09:20.864	2026-06-18 08:09:20.864	\N	\N
654b6efd-d07f-4807-a203-919a9e285841	ORD-20260618-00003	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	4900.00	0.00	0.00	0.00	4900.00	[]	\N	\N	\N	{"checkoutId": "d746b0a1-c8bf-4138-a0fb-2aef0ec911ee", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:21:55.29	2026-06-18 08:21:55.29	\N	\N
6c504841-7bb6-45f0-bf1a-58fda35f2000	ORD-20260618-00004	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	10.00	0.00	0.00	0.00	10.00	[]	\N	\N	\N	{"checkoutId": "07a7fe79-340d-43d5-bb48-7bfc70b24abf", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:23:36.138	2026-06-18 08:23:36.138	\N	\N
b57f8179-1e64-4504-9e63-74e0aff73c27	ORD-20260618-00005	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	10.00	0.00	0.00	0.00	10.00	[]	\N	\N	\N	{"checkoutId": "eede4445-1da2-459b-8a95-b8be94bdea6d", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:44:50.292	2026-06-18 08:44:50.292	\N	\N
b65a1ffc-c717-42f5-a104-066d8fd6dd12	ORD-20260618-00006	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	0.00	0.00	100.00	[]	\N	\N	\N	{"checkoutId": "0c428526-f1eb-4864-a84b-d661b026b1fb", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:09:03.079	2026-06-18 09:09:03.079	\N	\N
bc071ff0-87c0-484a-93a4-286961c91d20	ORD-20260618-00007	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	80.00	0.00	0.00	0.00	80.00	[]	\N	\N	\N	{"checkoutId": "d847292b-3d62-40bf-9f11-35fc6e7466f2", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:27:40.29	2026-06-18 09:27:40.29	\N	\N
51ec8a89-eff9-49d9-964e-5420a013ea3b	ORD-20260618-00008	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	200.00	0.00	0.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "93d1db05-b4c2-47fe-803a-829108528166", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:41:10.485	2026-06-18 09:41:10.485	\N	\N
cb80ad0a-2a4f-40e7-a4ac-f3bfbd007b1a	ORD-20260618-00009	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	159.00	0.00	0.00	0.00	159.00	[]	\N	\N	\N	{"checkoutId": "afcc0bdd-f4d3-4a6f-9b95-40fb3881a856", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:42:40.827	2026-06-18 09:42:40.827	\N	\N
d3559801-23d2-4547-8f47-153a81fd2451	ORD-20260618-00010	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	10.00	99.00	0.00	189.00	[]	\N	\N	\N	{"checkoutId": "bfb2ebb1-4097-40cf-bd9b-ae02bab05c77", "shippingMethod": {"cost": 99, "currency": "PKR", "methodId": "00000000-0000-0000-0000-000000000002", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:49:44.552	2026-06-18 09:49:44.552	\N	\N
fc750368-9e2b-4ff9-a64d-fb1693c0b1c9	ORD-20260618-00011	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	370.00	0.00	99.00	0.00	469.00	[]	\N	\N	\N	{"checkoutId": "f1df211d-eed4-4a25-ad56-fd3a5f9f5478", "shippingMethod": {"cost": 99, "currency": "PKR", "methodId": "00000000-0000-0000-0000-000000000002", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 12:38:28.752	2026-06-18 12:38:28.752	\N	\N
dfba12bc-f5ab-4c8e-9f3c-9feecc6a2bae	ORD-20260619-00001	9edfe779-d5f5-45c4-8271-cd23126ae215	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	guest+b89cb48f-a650-4039-9df4-22b45446512a@checkout.local	\N	{"city": "karachi", "label": "", "state": "Khyber Pakhtunkhwa", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Khyber Pakhtunkhwa", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	10.00	0.00	100.00	0.00	110.00	[]	\N	\N	\N	{"checkoutId": "b89cb48f-a650-4039-9df4-22b45446512a", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 06:57:03.373	2026-06-19 06:57:03.373	\N	\N
701297c8-2e33-4fc7-a618-d181d864d6fa	ORD-20260619-00002	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	370.00	0.00	100.00	0.00	470.00	[]	\N	\N	\N	{"checkoutId": "86756ec5-4383-4260-a2a1-f68302b4b63a", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 07:19:21.228	2026-06-19 07:19:21.228	\N	\N
6d341f68-d4da-4b7f-986b-6b22a3377947	ORD-20260619-00003	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	200.00	20.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "397c979f-5467-4161-91ff-8afd37353997", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 10:59:14.241	2026-06-19 10:59:14.241	\N	\N
fce4769d-051a-4182-a8ee-f013e140c6c9	ORD-20260619-00004	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	180.00	0.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "61e5ec78-ed9e-41de-a213-6a183879565e", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 11:23:13.302	2026-06-19 11:23:13.302	\N	\N
5b3a844d-5a71-4503-8a0e-83e67e5bd951	ORD-20260619-00005	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "9dfd5ac6-9256-4300-a359-03281737ba78", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 11:30:32.378	2026-06-19 11:30:32.378	\N	\N
3f9b5d6c-f5f6-4ba5-96dc-d42e683a3839	ORD-20260619-00006	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	20.00	0.00	100.00	0.00	120.00	[]	\N	\N	\N	{"checkoutId": "7c83b8d2-6393-4ce0-88ef-630f341eb19d", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 12:12:24.443	2026-06-19 12:12:24.443	\N	\N
2b2fec3f-6790-410f-a40a-cb56bb87e12e	ORD-20260619-00007	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	159.00	0.00	100.00	0.00	259.00	[]	\N	\N	\N	{"checkoutId": "ec54292b-8e2f-4eaa-9f2e-45485c42bbcb", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 12:39:21.758	2026-06-19 12:39:21.758	\N	\N
4c82e16e-4174-4bdc-a945-f4f335fdc0d5	ORD-20260622-00001	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "4a7439f1-fb89-4107-882c-b7678b20e391", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-22 07:35:45.863	2026-06-22 07:35:45.863	\N	\N
a2ef88db-85e1-41f3-b3a1-d8ab6c641dbe	ORD-20260622-00002	d52a8862-ec38-4fba-adb6-3a6646cafddb	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	contentdigital21@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "e885cd37-60f2-4a3c-9a38-a2f58d73d33c", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-22 09:00:05.197	2026-06-22 09:00:05.197	\N	\N
\.


--
-- TOC entry 5516 (class 0 OID 21332)
-- Dependencies: 240
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, provider, flow_type, is_active, config, metadata, created_at, updated_at) FROM stdin;
1f3e4b70-63ff-4b05-a95f-e7b3612dc405	cod	Cash on Delivery	cod	OFFLINE	t	{}	{"sortOrder": 10}	2026-05-04 07:33:12.787	2026-05-15 05:42:35.159
\.


--
-- TOC entry 5517 (class 0 OID 21351)
-- Dependencies: 241
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, payment_method_id, status, flow_type, amount, currency, gateway_transaction_id, client_secret, redirect_url, gateway_response, captured_at, failed_at, refunded_at, created_at, updated_at) FROM stdin;
d88b3cf9-218a-4f6f-bfcd-2fbf58f1909c	4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	32.87	USD	COD-f1a50684-3047-4c91-b51e-b2ae3b6b781c	\N	\N	{"orderId": "4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd", "orderNumber": "ORD-20260504-00001", "paymentMethod": "cod", "transactionId": "COD-f1a50684-3047-4c91-b51e-b2ae3b6b781c"}	\N	\N	\N	2026-05-04 07:33:33.411	2026-05-04 07:33:33.411
38dd35c3-3cf1-4b4c-8d7e-5b7ae93138b9	0aaf74b5-f65e-4019-9d3e-fbc88d4b2238	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	999.00	PKR	COD-089d01eb-fc7f-4dc6-a545-742c42cda4f2	\N	\N	{"orderId": "0aaf74b5-f65e-4019-9d3e-fbc88d4b2238", "orderNumber": "ORD-20260613-00001", "paymentMethod": "cod", "transactionId": "COD-089d01eb-fc7f-4dc6-a545-742c42cda4f2"}	\N	\N	\N	2026-06-13 13:35:13.835	2026-06-13 13:35:13.835
d3941eb2-0019-46ff-b2b7-02d5ce7046f6	5bbb30ed-34a8-41d2-9d5b-da4510ff51bd	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	999.00	PKR	COD-a15bf94a-2f52-49ec-9ca6-718708d5d874	\N	\N	{"orderId": "5bbb30ed-34a8-41d2-9d5b-da4510ff51bd", "orderNumber": "ORD-20260613-00002", "paymentMethod": "cod", "transactionId": "COD-a15bf94a-2f52-49ec-9ca6-718708d5d874"}	\N	\N	\N	2026-06-13 13:35:46.838	2026-06-13 13:35:46.838
41a54b79-9f52-4503-980f-d16d130c6030	ed2aa604-ab97-46f0-b68d-e3adc79d8208	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	100.00	USD	COD-28ba3a23-c121-4e28-891c-9a142272f7ee	\N	\N	{"orderId": "ed2aa604-ab97-46f0-b68d-e3adc79d8208", "orderNumber": "ORD-20260618-00001", "paymentMethod": "cod", "transactionId": "COD-28ba3a23-c121-4e28-891c-9a142272f7ee"}	\N	\N	\N	2026-06-18 07:58:09.379	2026-06-18 07:58:09.379
0bfb01be-c027-44c8-be87-35a6c3e3e895	4c768e17-67dc-4338-954f-579e75b349e5	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	50.00	USD	COD-1d566dcb-bdb0-48f7-bed4-3a776fafce2a	\N	\N	{"orderId": "4c768e17-67dc-4338-954f-579e75b349e5", "orderNumber": "ORD-20260618-00002", "paymentMethod": "cod", "transactionId": "COD-1d566dcb-bdb0-48f7-bed4-3a776fafce2a"}	\N	\N	\N	2026-06-18 08:09:20.911	2026-06-18 08:09:20.911
cfd9f2a0-dc8e-435c-8904-a506afb79c1e	654b6efd-d07f-4807-a203-919a9e285841	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	4900.00	USD	COD-55c07611-56e2-444c-a009-4e5775819856	\N	\N	{"orderId": "654b6efd-d07f-4807-a203-919a9e285841", "orderNumber": "ORD-20260618-00003", "paymentMethod": "cod", "transactionId": "COD-55c07611-56e2-444c-a009-4e5775819856"}	\N	\N	\N	2026-06-18 08:21:55.331	2026-06-18 08:21:55.331
346e59bc-e806-492d-bd27-a6c65ae06065	6c504841-7bb6-45f0-bf1a-58fda35f2000	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	10.00	USD	COD-5f412ced-12ca-43a9-8309-0a57611ecd72	\N	\N	{"orderId": "6c504841-7bb6-45f0-bf1a-58fda35f2000", "orderNumber": "ORD-20260618-00004", "paymentMethod": "cod", "transactionId": "COD-5f412ced-12ca-43a9-8309-0a57611ecd72"}	\N	\N	\N	2026-06-18 08:23:36.198	2026-06-18 08:23:36.198
5cf63ace-6c14-443f-843e-b31cbc896493	b57f8179-1e64-4504-9e63-74e0aff73c27	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	10.00	PKR	COD-01f7dc6e-8e15-4efc-88f7-ffde251a3f40	\N	\N	{"orderId": "b57f8179-1e64-4504-9e63-74e0aff73c27", "orderNumber": "ORD-20260618-00005", "paymentMethod": "cod", "transactionId": "COD-01f7dc6e-8e15-4efc-88f7-ffde251a3f40"}	\N	\N	\N	2026-06-18 08:44:50.373	2026-06-18 08:44:50.373
7912776c-7ee9-45ba-a118-d6ce8a2795a9	b65a1ffc-c717-42f5-a104-066d8fd6dd12	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	100.00	PKR	COD-d9342d73-2011-4a0d-8389-0fcf588ab650	\N	\N	{"orderId": "b65a1ffc-c717-42f5-a104-066d8fd6dd12", "orderNumber": "ORD-20260618-00006", "paymentMethod": "cod", "transactionId": "COD-d9342d73-2011-4a0d-8389-0fcf588ab650"}	\N	\N	\N	2026-06-18 09:09:03.128	2026-06-18 09:09:03.128
fb4a661a-d9dc-4bbd-9e7c-ec81cd55db16	bc071ff0-87c0-484a-93a4-286961c91d20	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	80.00	PKR	COD-344d1c99-647d-4748-91c2-12176ccdec91	\N	\N	{"orderId": "bc071ff0-87c0-484a-93a4-286961c91d20", "orderNumber": "ORD-20260618-00007", "paymentMethod": "cod", "transactionId": "COD-344d1c99-647d-4748-91c2-12176ccdec91"}	\N	\N	\N	2026-06-18 09:27:40.349	2026-06-18 09:27:40.349
168d7f74-5b8f-4ab8-9f29-0ead39dd590a	51ec8a89-eff9-49d9-964e-5420a013ea3b	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	200.00	PKR	COD-5c7fd56d-3612-497e-9a9e-05f2e68a53ee	\N	\N	{"orderId": "51ec8a89-eff9-49d9-964e-5420a013ea3b", "orderNumber": "ORD-20260618-00008", "paymentMethod": "cod", "transactionId": "COD-5c7fd56d-3612-497e-9a9e-05f2e68a53ee"}	\N	\N	\N	2026-06-18 09:41:10.543	2026-06-18 09:41:10.543
d929fb3f-9a29-4faa-aa46-c699a9534398	cb80ad0a-2a4f-40e7-a4ac-f3bfbd007b1a	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	159.00	PKR	COD-a6ca1acc-09bf-44ae-813c-398d6260b234	\N	\N	{"orderId": "cb80ad0a-2a4f-40e7-a4ac-f3bfbd007b1a", "orderNumber": "ORD-20260618-00009", "paymentMethod": "cod", "transactionId": "COD-a6ca1acc-09bf-44ae-813c-398d6260b234"}	\N	\N	\N	2026-06-18 09:42:40.862	2026-06-18 09:42:40.862
9213bc62-b500-46a5-9461-393109135f85	d3559801-23d2-4547-8f47-153a81fd2451	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	189.00	PKR	COD-687206ee-d15b-4429-b806-890ece9053a4	\N	\N	{"orderId": "d3559801-23d2-4547-8f47-153a81fd2451", "orderNumber": "ORD-20260618-00010", "paymentMethod": "cod", "transactionId": "COD-687206ee-d15b-4429-b806-890ece9053a4"}	\N	\N	\N	2026-06-18 09:49:44.606	2026-06-18 09:49:44.606
13a3dafd-631e-43ce-b63d-fc9a2a81b445	fc750368-9e2b-4ff9-a64d-fb1693c0b1c9	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	469.00	PKR	COD-731687f1-4a57-4192-9be1-6edccd6ed6c6	\N	\N	{"orderId": "fc750368-9e2b-4ff9-a64d-fb1693c0b1c9", "orderNumber": "ORD-20260618-00011", "paymentMethod": "cod", "transactionId": "COD-731687f1-4a57-4192-9be1-6edccd6ed6c6"}	\N	\N	\N	2026-06-18 12:38:28.797	2026-06-18 12:38:28.797
47d120fa-2127-432a-a9b1-2505835846ec	dfba12bc-f5ab-4c8e-9f3c-9feecc6a2bae	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	110.00	PKR	COD-6bdf1c11-711f-4d6c-bc7c-a1ec2ee38537	\N	\N	{"orderId": "dfba12bc-f5ab-4c8e-9f3c-9feecc6a2bae", "orderNumber": "ORD-20260619-00001", "paymentMethod": "cod", "transactionId": "COD-6bdf1c11-711f-4d6c-bc7c-a1ec2ee38537"}	\N	\N	\N	2026-06-19 06:57:03.441	2026-06-19 06:57:03.441
4fd76d01-dd04-4571-904e-20fc56234313	701297c8-2e33-4fc7-a618-d181d864d6fa	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	470.00	PKR	COD-797b4f91-38a0-4485-94b0-f6846ab372c3	\N	\N	{"orderId": "701297c8-2e33-4fc7-a618-d181d864d6fa", "orderNumber": "ORD-20260619-00002", "paymentMethod": "cod", "transactionId": "COD-797b4f91-38a0-4485-94b0-f6846ab372c3"}	\N	\N	\N	2026-06-19 07:19:21.284	2026-06-19 07:19:21.284
2979dcaa-1981-4dcb-94e1-0a6c2c1e67d0	6d341f68-d4da-4b7f-986b-6b22a3377947	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	280.00	PKR	COD-ac3f34ff-b2e2-4f4e-a591-44d07a878c49	\N	\N	{"orderId": "6d341f68-d4da-4b7f-986b-6b22a3377947", "orderNumber": "ORD-20260619-00003", "paymentMethod": "cod", "transactionId": "COD-ac3f34ff-b2e2-4f4e-a591-44d07a878c49"}	\N	\N	\N	2026-06-19 10:59:14.294	2026-06-19 10:59:14.294
4bf4eccc-fad6-4d20-baab-ef5d75899006	fce4769d-051a-4182-a8ee-f013e140c6c9	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	280.00	PKR	COD-f37763a4-d386-4fdc-9413-687e8321a5c9	\N	\N	{"orderId": "fce4769d-051a-4182-a8ee-f013e140c6c9", "orderNumber": "ORD-20260619-00004", "paymentMethod": "cod", "transactionId": "COD-f37763a4-d386-4fdc-9413-687e8321a5c9"}	\N	\N	\N	2026-06-19 11:23:13.468	2026-06-19 11:23:13.468
380b3e2f-0bcb-4dfd-aa59-7bcfcb92be83	5b3a844d-5a71-4503-8a0e-83e67e5bd951	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	200.00	PKR	COD-da7cf22d-a7b6-4491-bb45-7c57444bd7d4	\N	\N	{"orderId": "5b3a844d-5a71-4503-8a0e-83e67e5bd951", "orderNumber": "ORD-20260619-00005", "paymentMethod": "cod", "transactionId": "COD-da7cf22d-a7b6-4491-bb45-7c57444bd7d4"}	\N	\N	\N	2026-06-19 11:30:32.461	2026-06-19 11:30:32.461
0a3d6809-6215-4895-8b13-0fde345c365d	3f9b5d6c-f5f6-4ba5-96dc-d42e683a3839	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	120.00	PKR	COD-9b766965-9c02-4ad5-ba66-6ae08d0ea58d	\N	\N	{"orderId": "3f9b5d6c-f5f6-4ba5-96dc-d42e683a3839", "orderNumber": "ORD-20260619-00006", "paymentMethod": "cod", "transactionId": "COD-9b766965-9c02-4ad5-ba66-6ae08d0ea58d"}	\N	\N	\N	2026-06-19 12:12:24.529	2026-06-19 12:12:24.529
4d1fea38-a90b-4dfd-9ff7-4a965ddffa7a	2b2fec3f-6790-410f-a40a-cb56bb87e12e	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	259.00	PKR	COD-f3bc001f-e169-44df-8a5f-7899eabc8deb	\N	\N	{"orderId": "2b2fec3f-6790-410f-a40a-cb56bb87e12e", "orderNumber": "ORD-20260619-00007", "paymentMethod": "cod", "transactionId": "COD-f3bc001f-e169-44df-8a5f-7899eabc8deb"}	\N	\N	\N	2026-06-19 12:39:21.863	2026-06-19 12:39:21.863
40869ae9-f6c8-4931-b1de-e9407b03cea0	4c82e16e-4174-4bdc-a945-f4f335fdc0d5	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	200.00	PKR	COD-f719d4c4-653b-4160-93c2-11728444b2c3	\N	\N	{"orderId": "4c82e16e-4174-4bdc-a945-f4f335fdc0d5", "orderNumber": "ORD-20260622-00001", "paymentMethod": "cod", "transactionId": "COD-f719d4c4-653b-4160-93c2-11728444b2c3"}	\N	\N	\N	2026-06-22 07:35:45.998	2026-06-22 07:35:45.998
2c30c797-1eee-4db2-80a7-12798797d347	a2ef88db-85e1-41f3-b3a1-d8ab6c641dbe	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	200.00	PKR	COD-fafce392-5e9f-4d92-9f75-2a225328c5d4	\N	\N	{"orderId": "a2ef88db-85e1-41f3-b3a1-d8ab6c641dbe", "orderNumber": "ORD-20260622-00002", "paymentMethod": "cod", "transactionId": "COD-fafce392-5e9f-4d92-9f75-2a225328c5d4"}	\N	\N	\N	2026-06-22 09:00:05.332	2026-06-22 09:00:05.332
\.


--
-- TOC entry 5518 (class 0 OID 21368)
-- Dependencies: 242
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (product_id, category_id, "position") FROM stdin;
\.


--
-- TOC entry 5519 (class 0 OID 21377)
-- Dependencies: 243
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, variant_id, url, alt_text, "position", is_primary, created_at) FROM stdin;
2ca56043-4926-4270-975c-8f69c3483331	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/124af3bb-9b89-4704-b707-c24e39c6b4ce.jpeg	Test Product	4	f	2026-06-17 11:54:37.479
28fc9eeb-3b3d-40df-8168-815dfefcbcaf	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/eea4ad2d-e2e2-4c52-9ba9-9177c9d5a314.jpeg	Test Product	0	t	2026-06-17 11:48:36.078
97035159-6006-4b3a-bd98-55ce711a3f32	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/20d73cc9-19d1-4a71-87b0-5e2c6effba46.jpeg	Test Product	1	f	2026-06-17 11:53:43.195
cd48eabd-2434-42ae-9846-18043152b8d1	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/32f9933d-55ed-4d1b-ab48-2a2b109fada7.jpeg	Test Product	2	f	2026-06-17 11:54:29.437
cc125aee-01b9-455a-94d7-36ac23b46384	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/d9ac872c-403e-4d37-83a9-b3ea0fb66368.jpeg	Test Product	3	f	2026-06-17 11:54:29.49
a7f2a067-ff15-4cad-b86f-229f16c30b2b	64289463-e48b-4261-bfef-e59b622eb20e	\N	http://localhost:3000/uploads/products/6d5b97c9-1585-44a1-8d77-6ae16f7a74b9.jpeg	Test Product	5	f	2026-06-17 11:54:37.526
1e5e50d7-5649-4ca9-9519-bc13d1bd0378	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	http://localhost:3000/uploads/products/36c2d557-9508-46cb-8d9e-66a810432851.jpeg	Hand Wash	0	t	2026-06-17 11:59:00.99
4f7aadda-99ac-4437-a6d6-e6595a469823	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	http://localhost:3000/uploads/products/53b7909a-1f92-453c-8f07-c0a2fd947036.jpeg	Hand Wash	1	f	2026-06-17 11:59:53.188
255dab1a-6444-44d0-8f83-4781d1001c93	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	http://localhost:3000/uploads/products/a932129a-8228-405a-8a1f-d0570efec49c.jpeg	Hand Wash	2	f	2026-06-17 11:59:53.232
2c009e49-b8cd-444e-aff5-a6e0ba9f5d5f	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	http://localhost:3000/uploads/products/674d9cf2-3297-4b76-9ebf-e2099ad96212.jpeg	Hand Wash	3	f	2026-06-17 11:59:53.274
d2c80601-4641-4c76-bb20-45252061f2e7	0019bc5a-cfda-423a-8033-04e19527878c	\N	http://localhost:3000/uploads/products/905c572b-3817-46d5-a6a9-5fdd0b8de7e9.jpeg	Tibet Beauty Soap	0	t	2026-06-17 12:03:00.728
cc249ac8-0749-4b6c-8788-233588fd1656	0019bc5a-cfda-423a-8033-04e19527878c	\N	http://localhost:3000/uploads/products/f71e8fc7-e121-4340-b9a0-2f97acb35e1f.jpeg	Tibet Beauty Soap	1	f	2026-06-17 12:03:36.104
bef610c7-fa9d-47cf-aad3-68c1a7e18808	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	http://localhost:3000/uploads/products/1e8bdd31-f201-49d6-8110-1dd5bbd8238b.jpeg	Euro Beauty Soap	0	t	2026-06-17 12:04:39.635
99a05603-bfe5-4951-847c-f8050e8719b9	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	http://localhost:3000/uploads/products/fc8277ee-03f9-4d60-bb78-bc52f9ed2648.jpeg	Euro Beauty Soap	1	f	2026-06-17 12:05:04.791
940e6aaf-e45e-4ed0-b593-65d801484cbd	2e6248be-15bb-45a8-8dc1-245118193c6f	\N	http://localhost:3000/uploads/products/e8c06101-66ec-4856-b5da-319ad1cc5169.jpeg	Khaleej Washing Soap	0	t	2026-06-17 12:08:05.931
d04fb353-7634-4f5f-8e0d-ac85e602a207	2e6248be-15bb-45a8-8dc1-245118193c6f	\N	http://localhost:3000/uploads/products/126ed68b-b033-4e1d-b75e-379587ed87f2.jpeg	Khaleej Washing Soap	1	f	2026-06-17 12:08:17.108
de658086-f967-4dd6-a9f1-92c2ce1f42b1	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	\N	http://localhost:3000/uploads/products/ecde5d99-585d-470c-8f4f-37b0ecd7f6b6.jpeg	Misaal Washing Soap	0	t	2026-06-17 12:12:32.182
8ea72bba-f4d1-488d-94ef-bdac93c198cd	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	\N	http://localhost:3000/uploads/products/82d8decc-340d-44fe-80e7-ee9776cd9a54.jpeg	Misaal Washing Soap	1	f	2026-06-17 12:13:09.86
2c938234-e056-4360-9298-bea6974c3a9d	11920e18-2c21-473c-a201-54cfa6870a03	\N	http://localhost:3000/uploads/products/88802a3a-bf0b-414c-ade3-a68534a94924.jpeg	Fatty Brown Washing Soap	0	t	2026-06-17 12:15:17.516
97c8c94c-21b7-4d71-9366-9c70879e94e0	11920e18-2c21-473c-a201-54cfa6870a03	\N	http://localhost:3000/uploads/products/28d38daa-11c3-46a3-92d1-0465b11a9990.jpeg	Fatty Brown Washing Soap	1	f	2026-06-17 12:15:24.318
c6b08523-db94-4349-9854-7aabf6588d60	eb72e342-64df-4566-8029-db2c63859130	\N	http://localhost:3000/uploads/products/71451c33-cbd4-4a30-83b5-3f4145a8d49a.jpeg	Perfume Phenyl	0	t	2026-06-17 12:17:15.72
f0051af3-cf64-4513-a32f-9cde6f311d7e	eb72e342-64df-4566-8029-db2c63859130	\N	http://localhost:3000/uploads/products/38351eab-c533-4155-88e5-c3cb12ba13fa.jpeg	Perfume Phenyl	1	f	2026-06-17 12:18:41.938
d83698f0-c4a7-4bcc-8db5-e90843a81674	eb72e342-64df-4566-8029-db2c63859130	\N	http://localhost:3000/uploads/products/edba298e-061d-4caf-891d-88f95b3b6e9d.jpeg	Perfume Phenyl	2	f	2026-06-17 12:18:41.985
959dac31-b1ad-4f20-ae04-346419de033e	eb72e342-64df-4566-8029-db2c63859130	\N	http://localhost:3000/uploads/products/61521d6d-9278-4e54-a574-7d51fa91c4f8.jpeg	Perfume Phenyl	3	f	2026-06-17 12:18:42.03
b9cf1be8-29e0-4bdd-b356-6e858bc64c56	72c84214-a05b-40e8-9093-d76177afd8d9	\N	http://localhost:3000/uploads/products/70986ee9-fdb9-43f1-9cf6-0d6e61250ca8.jpeg	Toilet Bowl Cleaner	0	t	2026-06-17 12:21:11.58
93d9e533-28f4-413d-a800-393c2b0096e3	72c84214-a05b-40e8-9093-d76177afd8d9	\N	http://localhost:3000/uploads/products/12d4e364-6d9e-467f-b079-a6a36d129c92.jpeg	Toilet Bowl Cleaner	1	f	2026-06-17 12:21:32.633
28166f83-fe31-433b-8813-4279d291fa1d	5eaf65df-0faa-4975-be7b-6a2554a04f13	\N	http://localhost:3000/uploads/products/e2efe486-c41b-4700-879c-f2debc87b3fd.jpeg	Tile Wash	0	t	2026-06-17 12:22:31.416
55bf6489-92c8-4ea4-98f4-cd6fe59b0c47	5eaf65df-0faa-4975-be7b-6a2554a04f13	\N	http://localhost:3000/uploads/products/1e757918-a026-4b58-ae83-fbed6eb6e19b.jpeg	Tile Wash	1	f	2026-06-17 12:22:49.322
3d151832-4cd2-47a5-b5df-cff38010888f	230f5c47-5d61-4da1-adfc-6aa5d46f7111	\N	http://localhost:3000/uploads/products/de9655a5-c074-41b3-a932-01cb5f1ed10e.jpeg	Bleach Cleaner	0	t	2026-06-17 12:23:50.226
f7faaa6b-5348-480a-b3a6-6831b6cd0bab	230f5c47-5d61-4da1-adfc-6aa5d46f7111	\N	http://localhost:3000/uploads/products/b93b7fd3-0a20-4365-8a31-7743c041be78.jpeg	Bleach Cleaner	1	f	2026-06-17 12:24:48.093
473040c0-738c-4015-958e-844472b8ef53	df541ce1-98b2-49a0-8479-f5a9e1532a85	\N	http://localhost:3000/uploads/products/f1d3659c-e8a6-4841-b2ba-16dcad409431.jpeg	Glass Cleaner (Clean 360)	0	t	2026-06-17 12:27:56.757
f93f1914-0a7a-414c-9486-1dd6e6473604	df541ce1-98b2-49a0-8479-f5a9e1532a85	\N	http://localhost:3000/uploads/products/aa875cd4-2523-4a96-b0ef-537be7171948.jpeg	Glass Cleaner (Clean 360)	1	f	2026-06-17 12:28:09.307
a0f33223-b30e-4ea2-b68d-98178948db8e	b4366645-b14a-4de1-b621-e8776dc4f689	\N	http://localhost:3000/uploads/products/85d40ec1-22b4-41b3-b485-ce02a3f10a7b.jpeg	Panda Perfume Phenyl	0	t	2026-06-17 12:30:01.514
c22e7d14-910d-4ddd-9b2c-8c533c56e7f9	b4366645-b14a-4de1-b621-e8776dc4f689	\N	http://localhost:3000/uploads/products/5842750a-7a23-4618-aa15-28086e2637bf.jpeg	Panda Perfume Phenyl	1	f	2026-06-17 12:30:53.003
cda3df0f-31e7-48f2-a65a-f5b76d0db6e1	b4366645-b14a-4de1-b621-e8776dc4f689	\N	http://localhost:3000/uploads/products/1f919fca-d879-4996-80db-e9bbe547077d.jpeg	Panda Perfume Phenyl	2	f	2026-06-17 12:30:53.053
bd0d0ceb-c74c-4a6f-9e0a-7ce8c7399f6b	b4366645-b14a-4de1-b621-e8776dc4f689	\N	http://localhost:3000/uploads/products/866417a2-d561-4693-b4dc-de449ed6cce8.jpeg	Panda Perfume Phenyl	3	f	2026-06-17 12:30:53.097
db4d5c37-b6b0-4a3a-81bc-9431605f3b4f	b4366645-b14a-4de1-b621-e8776dc4f689	\N	http://localhost:3000/uploads/products/01445165-2334-4ed3-ad6e-328174e601f5.jpeg	Panda Perfume Phenyl	4	f	2026-06-17 12:30:53.139
02bf1856-c9ff-417d-afbe-ab67f884250f	03e5ef08-6883-4fd0-9583-94a2734aad9a	\N	http://localhost:3000/uploads/products/66da266a-d52b-46da-a138-77ad84696bef.jpeg	Panda Liquid Neel	0	t	2026-06-17 12:33:38.079
3f731fae-25f8-4520-a9bc-9e0f45a9f50c	03e5ef08-6883-4fd0-9583-94a2734aad9a	\N	http://localhost:3000/uploads/products/ebd5d91b-44db-4d5d-80f1-a5c82ddcf14a.jpeg	Panda Liquid Neel	1	f	2026-06-17 12:33:46.027
2396adb6-151b-4e8b-bbec-c2bccc61af94	07b2bf6a-2585-42f2-a7fd-ecc432b11861	\N	http://localhost:3000/uploads/products/251a93d2-b237-4bee-bdb3-07da60c6d035.jpeg	Cockroach Killer	0	t	2026-06-17 12:34:49.17
0ec0bf14-1758-4ebe-a35c-3f2872e20a6e	07b2bf6a-2585-42f2-a7fd-ecc432b11861	\N	http://localhost:3000/uploads/products/3bbd6059-9dcb-4a47-9725-8abe84286714.jpeg	Cockroach Killer	1	f	2026-06-17 12:34:59.264
b8e6e12b-bed3-4e90-8c1d-1a78f8088e99	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	\N	http://localhost:3000/uploads/products/8e8d394e-aab0-4c74-8390-41ea4845f784.jpeg	Clean360 Bleach Exra Strong	0	t	2026-06-17 12:36:13.727
4e24fb17-99ba-4d67-8c0d-54cebde0d617	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	\N	http://localhost:3000/uploads/products/8c42fb20-dea6-43ee-a657-a107d153a0a7.jpeg	Clean360 Bleach Exra Strong	1	f	2026-06-17 12:36:19.344
0073c047-db73-48d5-96fc-0c079c9424c2	09cfaa0d-9088-4e2d-823e-3ad80af8853b	\N	http://localhost:3000/uploads/products/0c2e39fe-26c3-416f-8cd0-72747aa624be.jpeg	Sweep-o Floor & Tile Cleaner	0	t	2026-06-17 12:37:49.904
80e874da-6b48-4ca1-9f89-f8910de05d0d	09cfaa0d-9088-4e2d-823e-3ad80af8853b	\N	http://localhost:3000/uploads/products/9dfb637c-8990-4732-8746-6c5f754c10d9.jpeg	Sweep-o Floor & Tile Cleaner	1	f	2026-06-17 12:38:07.53
557101a9-17a0-4a40-8fa3-7e0fb2415c2b	2881ef70-d26b-4da5-af06-9e0c5795fee4	\N	http://localhost:3000/uploads/products/2f73209e-0c72-4a77-ade9-8f2bbf5fa46a.jpeg	Dish Wash Liquid	0	t	2026-06-17 12:40:11.362
46e3876c-15f0-4fa7-9ac0-7111fbf6c438	2881ef70-d26b-4da5-af06-9e0c5795fee4	\N	http://localhost:3000/uploads/products/27fd70c6-7bb4-4988-9add-db66559a77a7.jpeg	Dish Wash Liquid	1	f	2026-06-17 12:40:26.294
257bbbf4-f00b-4266-9721-a78fb90433f5	1f87d70a-7fb5-43e9-a41c-87b29873a33b	\N	http://localhost:3000/uploads/products/f75f64db-05ba-4ef6-82b6-855acf3a2e68.jpeg	Super Sony	0	t	2026-06-17 12:42:28.871
c079e621-3be1-4f13-8716-cf3e6fccc6ba	1f87d70a-7fb5-43e9-a41c-87b29873a33b	\N	http://localhost:3000/uploads/products/b02cb0cb-2939-47b3-a126-60dcc2dac186.jpeg	Super Sony	1	f	2026-06-17 12:42:41.98
411d8c27-1331-4968-846b-d1bcf01a355c	1f87d70a-7fb5-43e9-a41c-87b29873a33b	\N	http://localhost:3000/uploads/products/f7768c74-fe25-4c4c-b389-7dbff39a9806.jpeg	Super Sony	2	f	2026-06-17 12:42:42.029
13c767e6-e16f-4792-bd91-e52d5ee564e4	90792798-2b85-4423-8eba-e7f12c64617d	\N	http://localhost:3000/uploads/products/451ccb4f-99dc-408c-bd90-f5d75263afdf.jpeg	777 Sony Dish Wash Soap	0	t	2026-06-17 12:44:44.044
7f54a276-f3f9-4fd2-93d2-fea01d6b6673	90792798-2b85-4423-8eba-e7f12c64617d	\N	http://localhost:3000/uploads/products/b1b1d873-2877-43b9-ad15-34a28ec2ca0a.jpeg	777 Sony Dish Wash Soap	1	f	2026-06-17 12:44:50.393
7f3d6fcd-2d8f-4df1-a838-3f2f7a8912cf	05268a8c-518a-4ff4-8691-3cfdff054382	\N	http://localhost:3000/uploads/products/3e6b240a-52d2-4dfd-88b7-67de8376d54b.jpeg	Dish Wash Scourer	0	t	2026-06-17 12:46:19.191
4fa3401b-150f-40f0-975e-2cffa4800a85	05268a8c-518a-4ff4-8691-3cfdff054382	\N	http://localhost:3000/uploads/products/77ecf402-9549-4c21-9695-e028c8d6b830.jpeg	Dish Wash Scourer	1	f	2026-06-17 12:46:26.557
\.


--
-- TOC entry 5520 (class 0 OID 21391)
-- Dependencies: 244
-- Data for Name: product_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values (id, option_id, value, code, sort_order, is_active, created_at, updated_at) FROM stdin;
98acf219-fadc-4e60-88f9-3b660145230d	a39db598-111e-4007-bf54-f564b2c1f587	Family pack	family pack	1	t	2026-05-08 06:44:01.979	2026-05-08 06:44:01.979
e2ca73f9-da0c-4357-ad26-0a3b5234734c	a39db598-111e-4007-bf54-f564b2c1f587	Pack of 2	pack of 2	2	t	2026-05-08 06:44:35.317	2026-05-08 06:44:35.317
d79e5779-4b44-422c-bcb0-43743dba8196	a39db598-111e-4007-bf54-f564b2c1f587	Pack of 3	pack of 3	3	t	2026-05-08 06:46:44.189	2026-05-08 06:46:44.189
0888e912-f7f3-466c-9603-d8958d9b139f	59574408-864b-4fb3-a08f-5ee2211a8ba1	Pink Lily	\N	0	t	2026-06-17 07:36:00.466	2026-06-17 07:36:00.466
fcdd232c-7426-4e25-b32f-df5103b7f511	59574408-864b-4fb3-a08f-5ee2211a8ba1	Cucumber	\N	1	t	2026-06-17 07:36:12.173	2026-06-17 07:36:12.173
5c00a20f-7157-4e94-9797-eb233b0f8c48	59574408-864b-4fb3-a08f-5ee2211a8ba1	Orchid	\N	2	t	2026-06-17 07:36:26.071	2026-06-17 07:36:26.071
e86955c2-ebde-4ba0-9925-743eb1a2371e	906abee1-8c7f-4645-8193-973989132503	1Ltr	1ltr	1	t	2026-05-08 06:41:49.12	2026-06-17 07:38:35.38
f56ce2c9-7e87-4eaf-8588-d6c8822a106e	906abee1-8c7f-4645-8193-973989132503	1.5Ltr	1.5ltr	2	t	2026-05-08 06:42:02.481	2026-06-17 07:38:51.805
0f01dc86-2798-4ffb-9902-663a759b845e	906abee1-8c7f-4645-8193-973989132503	2Ltr	2ltr	3	t	2026-05-08 06:42:18.355	2026-06-17 07:39:05.79
4a6d58f7-9b22-4f4c-8705-50e82bac2c1b	40b86c40-f78a-4c90-9fab-1eb3a477e214	Tile Wash	\N	0	t	2026-06-17 07:39:42.677	2026-06-17 07:39:42.677
5c9cc638-ce29-4993-a519-c62940e11359	40b86c40-f78a-4c90-9fab-1eb3a477e214	Toilet Bowl Cleaner	\N	1	t	2026-06-17 07:39:59.964	2026-06-17 07:39:59.964
30d60dcc-867c-4fbd-a208-4aef88480725	59574408-864b-4fb3-a08f-5ee2211a8ba1	Rose	rose	0	t	2026-05-08 06:40:33.172	2026-06-17 07:45:02.356
0bb4c7bc-d181-4c9a-869e-4aeae5df4031	59574408-864b-4fb3-a08f-5ee2211a8ba1	Camay	camay	1	t	2026-06-17 07:45:18.707	2026-06-17 07:45:18.707
b033714c-5f8e-4478-a69c-ef52d7313422	59574408-864b-4fb3-a08f-5ee2211a8ba1	Lemon	lemon	3	t	2026-06-17 07:45:29.071	2026-06-17 07:45:29.071
19de1996-4f10-4589-95f8-06a01d8a61cb	40b86c40-f78a-4c90-9fab-1eb3a477e214	Dish wash liquid	dish wash liquid	0	t	2026-06-17 07:47:03.436	2026-06-17 07:47:03.436
46b3d7e5-286f-4b3e-8418-8094a0676e3f	40b86c40-f78a-4c90-9fab-1eb3a477e214	Dish Wash Saop	dish wash saop	1	t	2026-06-17 07:49:02.206	2026-06-17 07:49:02.206
f34de9c0-5dd7-48b1-bef4-9b8f72f95a86	59574408-864b-4fb3-a08f-5ee2211a8ba1	Honey almond	honey almond	4	t	2026-06-17 11:50:09.772	2026-06-17 11:50:09.772
11eca007-82d2-44d8-b07c-b9aad4ed0ec4	59574408-864b-4fb3-a08f-5ee2211a8ba1	White Rose	white rose	3	t	2026-06-17 11:50:32.325	2026-06-17 11:50:32.325
0c67d0de-3c86-4047-b10c-fea938d735d5	59574408-864b-4fb3-a08f-5ee2211a8ba1	Blue	blue	2	t	2026-06-17 11:59:15.806	2026-06-17 11:59:15.806
edcb2d16-3ef8-46ed-84c0-b55925836025	59574408-864b-4fb3-a08f-5ee2211a8ba1	Levander	\N	1	t	2026-06-17 12:19:05.847	2026-06-17 12:19:05.847
adda47fd-5c46-4ebf-8a6e-133548aba59e	59574408-864b-4fb3-a08f-5ee2211a8ba1	White	white	2	t	2026-06-17 12:19:27.034	2026-06-17 12:19:27.034
d1f00583-8325-4de2-8d03-13e550682edd	59574408-864b-4fb3-a08f-5ee2211a8ba1	Jasmine	jasmine	3	t	2026-06-17 12:19:40.403	2026-06-17 12:19:40.403
82b87405-7303-4194-8470-0b74022faa4c	906abee1-8c7f-4645-8193-973989132503	3Ltr	3ltr	3	t	2026-06-17 12:31:16.13	2026-06-17 12:31:16.13
12e6652f-be05-405f-8647-8cc760628251	a39db598-111e-4007-bf54-f564b2c1f587	Small	small	4	t	2026-06-17 12:43:11.905	2026-06-17 12:43:11.905
b7624b89-1245-4380-936f-3ec1cc995001	a39db598-111e-4007-bf54-f564b2c1f587	Long Bar	long bar	5	t	2026-06-17 12:43:24.898	2026-06-17 12:43:24.898
08b9ab65-eba3-4875-a761-485f6196f74e	a39db598-111e-4007-bf54-f564b2c1f587	1Pcs	1pcs	0	t	2026-06-17 13:03:55.272	2026-06-17 13:03:55.272
a2203e30-f48b-48d9-8a20-f17b52937ced	a39db598-111e-4007-bf54-f564b2c1f587	1Bottle	1bottle	0	t	2026-06-17 13:06:28.529	2026-06-17 13:06:28.529
ff90c3cc-146f-4def-8f27-2ea350291c61	a39db598-111e-4007-bf54-f564b2c1f587	Large	large	6	t	2026-06-18 13:21:27.251	2026-06-18 13:23:14.256
\.


--
-- TOC entry 5521 (class 0 OID 21406)
-- Dependencies: 245
-- Data for Name: product_option_values_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values_on_products (product_id, option_id, value_id) FROM stdin;
1f87d70a-7fb5-43e9-a41c-87b29873a33b	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
1f87d70a-7fb5-43e9-a41c-87b29873a33b	a39db598-111e-4007-bf54-f564b2c1f587	b7624b89-1245-4380-936f-3ec1cc995001
05268a8c-518a-4ff4-8691-3cfdff054382	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
2881ef70-d26b-4da5-af06-9e0c5795fee4	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
09cfaa0d-9088-4e2d-823e-3ad80af8853b	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
46ee9fc8-c21e-4b8c-9003-7337ea88ab68	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
07b2bf6a-2585-42f2-a7fd-ecc432b11861	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
03e5ef08-6883-4fd0-9583-94a2734aad9a	a39db598-111e-4007-bf54-f564b2c1f587	a2203e30-f48b-48d9-8a20-f17b52937ced
df541ce1-98b2-49a0-8479-f5a9e1532a85	a39db598-111e-4007-bf54-f564b2c1f587	a2203e30-f48b-48d9-8a20-f17b52937ced
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
2e6248be-15bb-45a8-8dc1-245118193c6f	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
11920e18-2c21-473c-a201-54cfa6870a03	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	0888e912-f7f3-466c-9603-d8958d9b139f
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	fcdd232c-7426-4e25-b32f-df5103b7f511
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	5c00a20f-7157-4e94-9797-eb233b0f8c48
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	f34de9c0-5dd7-48b1-bef4-9b8f72f95a86
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	11eca007-82d2-44d8-b07c-b9aad4ed0ec4
64289463-e48b-4261-bfef-e59b622eb20e	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
64289463-e48b-4261-bfef-e59b622eb20e	a39db598-111e-4007-bf54-f564b2c1f587	ff90c3cc-146f-4def-8f27-2ea350291c61
90792798-2b85-4423-8eba-e7f12c64617d	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
eaacdf54-eaa9-4dcc-839e-a10a61588523	59574408-864b-4fb3-a08f-5ee2211a8ba1	0bb4c7bc-d181-4c9a-869e-4aeae5df4031
eaacdf54-eaa9-4dcc-839e-a10a61588523	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
eaacdf54-eaa9-4dcc-839e-a10a61588523	59574408-864b-4fb3-a08f-5ee2211a8ba1	0c67d0de-3c86-4047-b10c-fea938d735d5
0019bc5a-cfda-423a-8033-04e19527878c	a39db598-111e-4007-bf54-f564b2c1f587	d79e5779-4b44-422c-bcb0-43743dba8196
eb72e342-64df-4566-8029-db2c63859130	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
eb72e342-64df-4566-8029-db2c63859130	59574408-864b-4fb3-a08f-5ee2211a8ba1	adda47fd-5c46-4ebf-8a6e-133548aba59e
eb72e342-64df-4566-8029-db2c63859130	59574408-864b-4fb3-a08f-5ee2211a8ba1	edcb2d16-3ef8-46ed-84c0-b55925836025
72c84214-a05b-40e8-9093-d76177afd8d9	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
5eaf65df-0faa-4975-be7b-6a2554a04f13	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
230f5c47-5d61-4da1-adfc-6aa5d46f7111	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
b4366645-b14a-4de1-b621-e8776dc4f689	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
b4366645-b14a-4de1-b621-e8776dc4f689	59574408-864b-4fb3-a08f-5ee2211a8ba1	adda47fd-5c46-4ebf-8a6e-133548aba59e
b4366645-b14a-4de1-b621-e8776dc4f689	59574408-864b-4fb3-a08f-5ee2211a8ba1	edcb2d16-3ef8-46ed-84c0-b55925836025
b4366645-b14a-4de1-b621-e8776dc4f689	59574408-864b-4fb3-a08f-5ee2211a8ba1	d1f00583-8325-4de2-8d03-13e550682edd
b4366645-b14a-4de1-b621-e8776dc4f689	906abee1-8c7f-4645-8193-973989132503	82b87405-7303-4194-8470-0b74022faa4c
\.


--
-- TOC entry 5522 (class 0 OID 21414)
-- Dependencies: 246
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options (id, name, code, is_active, created_at, updated_at) FROM stdin;
59574408-864b-4fb3-a08f-5ee2211a8ba1	Flavour	flavour	t	2026-05-08 06:39:04.167	2026-05-08 06:39:04.167
906abee1-8c7f-4645-8193-973989132503	Weight	weight	t	2026-05-08 06:41:25.572	2026-05-08 06:41:25.572
a39db598-111e-4007-bf54-f564b2c1f587	Pack	pack	t	2026-05-08 06:43:46.941	2026-05-08 06:43:46.941
40b86c40-f78a-4c90-9fab-1eb3a477e214	Item	item	t	2026-06-17 07:39:30.545	2026-06-17 07:39:30.545
\.


--
-- TOC entry 5523 (class 0 OID 21427)
-- Dependencies: 247
-- Data for Name: product_options_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options_on_products (product_id, option_id, is_required, "position") FROM stdin;
eaacdf54-eaa9-4dcc-839e-a10a61588523	59574408-864b-4fb3-a08f-5ee2211a8ba1	f	0
0019bc5a-cfda-423a-8033-04e19527878c	a39db598-111e-4007-bf54-f564b2c1f587	f	0
eb72e342-64df-4566-8029-db2c63859130	59574408-864b-4fb3-a08f-5ee2211a8ba1	t	0
72c84214-a05b-40e8-9093-d76177afd8d9	906abee1-8c7f-4645-8193-973989132503	f	0
5eaf65df-0faa-4975-be7b-6a2554a04f13	906abee1-8c7f-4645-8193-973989132503	t	0
230f5c47-5d61-4da1-adfc-6aa5d46f7111	906abee1-8c7f-4645-8193-973989132503	t	0
b4366645-b14a-4de1-b621-e8776dc4f689	59574408-864b-4fb3-a08f-5ee2211a8ba1	t	0
b4366645-b14a-4de1-b621-e8776dc4f689	906abee1-8c7f-4645-8193-973989132503	t	1
1f87d70a-7fb5-43e9-a41c-87b29873a33b	a39db598-111e-4007-bf54-f564b2c1f587	t	0
05268a8c-518a-4ff4-8691-3cfdff054382	a39db598-111e-4007-bf54-f564b2c1f587	t	0
2881ef70-d26b-4da5-af06-9e0c5795fee4	906abee1-8c7f-4645-8193-973989132503	t	0
09cfaa0d-9088-4e2d-823e-3ad80af8853b	906abee1-8c7f-4645-8193-973989132503	t	0
46ee9fc8-c21e-4b8c-9003-7337ea88ab68	906abee1-8c7f-4645-8193-973989132503	t	0
07b2bf6a-2585-42f2-a7fd-ecc432b11861	a39db598-111e-4007-bf54-f564b2c1f587	t	0
03e5ef08-6883-4fd0-9583-94a2734aad9a	a39db598-111e-4007-bf54-f564b2c1f587	t	0
df541ce1-98b2-49a0-8479-f5a9e1532a85	a39db598-111e-4007-bf54-f564b2c1f587	t	0
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	a39db598-111e-4007-bf54-f564b2c1f587	t	0
2e6248be-15bb-45a8-8dc1-245118193c6f	a39db598-111e-4007-bf54-f564b2c1f587	t	0
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	a39db598-111e-4007-bf54-f564b2c1f587	t	0
11920e18-2c21-473c-a201-54cfa6870a03	a39db598-111e-4007-bf54-f564b2c1f587	t	0
64289463-e48b-4261-bfef-e59b622eb20e	59574408-864b-4fb3-a08f-5ee2211a8ba1	f	0
64289463-e48b-4261-bfef-e59b622eb20e	a39db598-111e-4007-bf54-f564b2c1f587	t	1
90792798-2b85-4423-8eba-e7f12c64617d	a39db598-111e-4007-bf54-f564b2c1f587	t	0
\.


--
-- TOC entry 5524 (class 0 OID 21438)
-- Dependencies: 248
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, sku, name, price, cost, weight, attributes, "position", is_active, created_at, updated_at) FROM stdin;
f44c87d3-ea38-4329-bad9-b0a72e4d955d	eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003-ROSE	Flavour: Rose	200.00	\N	\N	{"optionValues": {"flavour": "Rose"}, "optionValueIds": {"flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	0	t	2026-06-17 11:59:30.488	2026-06-17 11:59:30.488
76e0bd60-36da-44ae-bff0-dd87635ce982	eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003-CAMAY	Flavour: Camay	200.00	\N	\N	{"optionValues": {"flavour": "Camay"}, "optionValueIds": {"flavour": "0bb4c7bc-d181-4c9a-869e-4aeae5df4031"}}	1	t	2026-06-17 11:59:30.503	2026-06-17 11:59:30.503
ec4803c2-6aa6-452c-aa1a-e23d0271d115	eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003-BLUE	Flavour: Blue	200.00	\N	\N	{"optionValues": {"flavour": "Blue"}, "optionValueIds": {"flavour": "0c67d0de-3c86-4047-b10c-fea938d735d5"}}	2	t	2026-06-17 11:59:30.51	2026-06-17 11:59:30.51
fdf241e4-b0d0-456e-8da6-eef5c1124666	eb72e342-64df-4566-8029-db2c63859130	SKU-008-ROSE	Flavour: Rose	120.00	\N	\N	{"optionValues": {"flavour": "Rose"}, "optionValueIds": {"flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	0	t	2026-06-17 12:19:55.8	2026-06-17 12:19:55.8
c36c179e-c2af-4e00-beea-dfd8a3cdec2c	eb72e342-64df-4566-8029-db2c63859130	SKU-008-LEVANDER	Flavour: Levander	120.00	\N	\N	{"optionValues": {"flavour": "Levander"}, "optionValueIds": {"flavour": "edcb2d16-3ef8-46ed-84c0-b55925836025"}}	1	t	2026-06-17 12:19:55.815	2026-06-17 12:19:55.815
663e25b8-ac9e-4892-b47c-c2e9514ef716	eb72e342-64df-4566-8029-db2c63859130	SKU-008-WHITE	Flavour: White	120.00	\N	\N	{"optionValues": {"flavour": "White"}, "optionValueIds": {"flavour": "adda47fd-5c46-4ebf-8a6e-133548aba59e"}}	2	t	2026-06-17 12:19:55.821	2026-06-17 12:19:55.821
b0d59239-7b73-492b-8cf8-d0ddba9b5d2e	230f5c47-5d61-4da1-adfc-6aa5d46f7111	SKU-011-1-5LTR	Weight: 1.5Ltr	80.00	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 12:25:21.533	2026-06-17 12:25:21.533
f48488c2-d01c-47a1-98f2-8073d9f103db	1f87d70a-7fb5-43e9-a41c-87b29873a33b	SKU-019-SMALL	Pack: Small	20.00	\N	\N	{"optionValues": {"pack": "Small"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251"}}	0	t	2026-06-17 12:43:52.656	2026-06-17 12:43:52.656
3ddee9a7-cbf0-4ce6-9f0a-1b71cf16d076	1f87d70a-7fb5-43e9-a41c-87b29873a33b	SKU-019-LONG-BAR	Pack: Long Bar	50.00	\N	\N	{"optionValues": {"pack": "Long Bar"}, "optionValueIds": {"pack": "b7624b89-1245-4380-936f-3ec1cc995001"}}	1	t	2026-06-17 12:43:52.67	2026-06-17 12:44:02.44
480fc5fd-9198-4c2f-ae38-8a0b052a9313	09cfaa0d-9088-4e2d-823e-3ad80af8853b	SKU-017-2LTR	Weight: 2Ltr	159.00	\N	\N	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	0	t	2026-06-17 13:05:19.644	2026-06-17 13:05:19.644
81b62a2b-ca50-48c2-8ee7-3628ab91a7a1	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001-1PCS	Pack: 1Pcs	110.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:09:42.151	2026-06-17 13:09:42.151
a0f519b2-b535-41bb-abae-c7bf57b39e4c	11920e18-2c21-473c-a201-54cfa6870a03	SKU-007-1PCS	Pack: 1Pcs	79.98	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:10:33.453	2026-06-17 13:10:33.453
c040a4a6-e6c4-42dd-b718-a0f40b02badc	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-CUCUMBER-SMALL	Flavour: Cucumber • Pack: Small	50.00	\N	\N	{"optionValues": {"pack": "Small", "flavour": "Cucumber"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251", "flavour": "fcdd232c-7426-4e25-b32f-df5103b7f511"}}	2	t	2026-06-19 08:12:28.535	2026-06-19 08:12:28.535
698b25db-dba8-4445-904d-42c73dccab7c	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-PINK-LILY-SMALL	Flavour: Pink Lily • Pack: Small	50.00	\N	\N	{"optionValues": {"pack": "Small", "flavour": "Pink Lily"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251", "flavour": "0888e912-f7f3-466c-9603-d8958d9b139f"}}	0	t	2026-06-19 08:12:28.505	2026-06-19 08:12:28.505
d1c1d523-51e8-43c4-a7cc-b8028c68a645	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-ORCHID-SMALL	Flavour: Orchid • Pack: Small	50.00	\N	\N	{"optionValues": {"pack": "Small", "flavour": "Orchid"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251", "flavour": "5c00a20f-7157-4e94-9797-eb233b0f8c48"}}	4	t	2026-06-19 08:12:28.55	2026-06-19 08:12:28.55
77cde620-dc5a-4d4b-9248-26b8b31ad58a	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-WHITE-ROSE-SMALL	Flavour: White Rose • Pack: Small	50.00	\N	\N	{"optionValues": {"pack": "Small", "flavour": "White Rose"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251", "flavour": "11eca007-82d2-44d8-b07c-b9aad4ed0ec4"}}	6	t	2026-06-19 08:12:28.566	2026-06-19 08:12:28.566
9de378fb-d5bc-4d5b-bf8a-5e1f10318aa1	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-HONEY-ALMOND-SMALL	Flavour: Honey almond • Pack: Small	50.00	\N	\N	{"optionValues": {"pack": "Small", "flavour": "Honey almond"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251", "flavour": "f34de9c0-5dd7-48b1-bef4-9b8f72f95a86"}}	8	t	2026-06-19 08:12:28.582	2026-06-19 08:12:28.582
cc51d3af-bbfc-420d-8122-96c69eba6b3a	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-HONEY-ALMOND-LARGE	Flavour: Honey almond • Pack: Large	100.00	\N	\N	{"optionValues": {"pack": "Large", "flavour": "Honey almond"}, "optionValueIds": {"pack": "ff90c3cc-146f-4def-8f27-2ea350291c61", "flavour": "f34de9c0-5dd7-48b1-bef4-9b8f72f95a86"}}	9	t	2026-06-19 08:12:28.59	2026-06-19 08:12:44.447
733b396a-9b08-4190-b3c4-5ab6ee899cac	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-ORCHID-LARGE	Flavour: Orchid • Pack: Large	100.00	\N	\N	{"optionValues": {"pack": "Large", "flavour": "Orchid"}, "optionValueIds": {"pack": "ff90c3cc-146f-4def-8f27-2ea350291c61", "flavour": "5c00a20f-7157-4e94-9797-eb233b0f8c48"}}	5	t	2026-06-19 08:12:28.559	2026-06-19 08:12:44.455
58daf9a0-a0ab-4273-b449-e6a076fc9acc	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-PACK-OF-3	Pack: Pack of 3	80.00	\N	\N	{"optionValues": {"pack": "Pack of 3"}, "optionValueIds": {"pack": "d79e5779-4b44-422c-bcb0-43743dba8196"}}	0	t	2026-06-17 12:02:33.213	2026-06-17 12:02:33.213
80c8d8b5-ebed-42d3-aca4-9611d4585f71	72c84214-a05b-40e8-9093-d76177afd8d9	SKU-009-1-5LTR	Weight: 1.5Ltr	200.00	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 12:21:22.498	2026-06-17 12:21:22.498
b85f7fa3-cb5b-4754-8399-6f792a3bf635	5eaf65df-0faa-4975-be7b-6a2554a04f13	SKU-010-1-5LTR	Weight: 1.5Ltr	80.00	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 12:22:41.869	2026-06-17 12:22:41.869
cd8e05c4-96f5-488b-aa34-74083d3e2978	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-ROSE-3LTR	Flavour: Rose • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "Rose"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	0	t	2026-06-17 12:31:36.385	2026-06-17 12:31:36.385
ad533fd1-8637-4268-bf5c-c8dcd1febdc6	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-LEVANDER-3LTR	Flavour: Levander • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "Levander"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "edcb2d16-3ef8-46ed-84c0-b55925836025"}}	1	t	2026-06-17 12:31:36.402	2026-06-17 12:31:36.402
34eddf36-827a-4247-9037-4af9dae3a462	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-WHITE-3LTR	Flavour: White • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "White"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "adda47fd-5c46-4ebf-8a6e-133548aba59e"}}	2	t	2026-06-17 12:31:36.41	2026-06-17 12:31:36.41
3fcd3a63-0d69-4368-8078-4094c1f0d595	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-JASMINE-3LTR	Flavour: Jasmine • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "Jasmine"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "d1f00583-8325-4de2-8d03-13e550682edd"}}	3	t	2026-06-17 12:31:36.418	2026-06-17 12:31:36.418
e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	05268a8c-518a-4ff4-8691-3cfdff054382	SKU-021-1PCS	Pack: 1Pcs	50.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:04:05.605	2026-06-17 13:04:05.605
4e7ea113-5c3c-4315-96f5-357735682caa	2881ef70-d26b-4da5-af06-9e0c5795fee4	SKU-018-1-5LTR	Weight: 1.5Ltr	79.98	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 13:04:53.64	2026-06-17 13:04:53.64
cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	SKU-016-2LTR	Weight: 2Ltr	180.00	\N	\N	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	0	t	2026-06-17 13:05:37.299	2026-06-17 13:05:37.299
efbf85a4-a7b1-4ead-83db-4c7df04e3790	07b2bf6a-2585-42f2-a7fd-ecc432b11861	SKU-015-1PCS	Pack: 1Pcs	100.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:05:50.637	2026-06-17 13:05:50.637
48de193f-546c-4de8-b665-15e8cab49584	03e5ef08-6883-4fd0-9583-94a2734aad9a	SKU-014-1BOTTLE	Pack: 1Bottle	100.00	\N	\N	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	0	t	2026-06-17 13:06:45.46	2026-06-17 13:06:45.46
120f37f1-42aa-45c0-b801-4731330886e3	df541ce1-98b2-49a0-8479-f5a9e1532a85	SKU-012-1BOTTLE	Pack: 1Bottle	200.00	\N	\N	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	0	t	2026-06-17 13:07:10.025	2026-06-17 13:07:10.025
5c75a449-39e0-4ec7-a6ff-d11dbb9f2d08	2e6248be-15bb-45a8-8dc1-245118193c6f	SKU-005-1PCS	Pack: 1Pcs	50.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:10:05.209	2026-06-17 13:10:05.209
85511305-b97c-4697-9e60-1ebb4ef4e0de	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	SKU-006-1PCS	Pack: 1Pcs	60.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:10:16.459	2026-06-17 13:10:16.459
24501ee4-c6e2-4123-927b-6cf3566f0acf	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-PINK-LILY-LARGE	Flavour: Pink Lily • Pack: Large	100.00	\N	\N	{"optionValues": {"pack": "Large", "flavour": "Pink Lily"}, "optionValueIds": {"pack": "ff90c3cc-146f-4def-8f27-2ea350291c61", "flavour": "0888e912-f7f3-466c-9603-d8958d9b139f"}}	1	t	2026-06-19 08:12:28.527	2026-06-19 08:12:44.433
44336f06-9b4d-4dd5-a651-c707a9bbc34a	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-CUCUMBER-LARGE	Flavour: Cucumber • Pack: Large	100.00	\N	\N	{"optionValues": {"pack": "Large", "flavour": "Cucumber"}, "optionValueIds": {"pack": "ff90c3cc-146f-4def-8f27-2ea350291c61", "flavour": "fcdd232c-7426-4e25-b32f-df5103b7f511"}}	3	t	2026-06-19 08:12:28.542	2026-06-19 08:12:44.449
531d2a81-91cf-4868-bc07-9319aca112fd	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-WHITE-ROSE-LARGE	Flavour: White Rose • Pack: Large	100.00	\N	\N	{"optionValues": {"pack": "Large", "flavour": "White Rose"}, "optionValueIds": {"pack": "ff90c3cc-146f-4def-8f27-2ea350291c61", "flavour": "11eca007-82d2-44d8-b07c-b9aad4ed0ec4"}}	7	t	2026-06-19 08:12:28.574	2026-06-19 08:12:44.448
dab15350-43b5-4b34-b7b5-19109578dfb6	90792798-2b85-4423-8eba-e7f12c64617d	SKU-020-1PCS	Pack: 1Pcs	20.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-19 11:43:27.985	2026-06-19 11:43:27.985
\.


--
-- TOC entry 5525 (class 0 OID 21456)
-- Dependencies: 249
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, slug, type, description, short_description, base_price, cost, weight, status, visibility, tax_class_id, attributes, meta_data, created_at, updated_at, deleted_at) FROM stdin;
df541ce1-98b2-49a0-8479-f5a9e1532a85	SKU-012	Glass Cleaner (Clean 360)	glass-cleaner-clean-360	configurable	\N	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:27:56.663	2026-06-17 12:27:56.663	\N
b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013	Panda Perfume Phenyl	panda-perfume-phenyl	configurable	\N	\N	370.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:30:01.373	2026-06-17 12:30:01.373	\N
46ee9fc8-c21e-4b8c-9003-7337ea88ab68	SKU-016	Clean360 Bleach Exra Strong	clean360-bleach-exra-strong	configurable	\N	\N	180.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:36:13.619	2026-06-17 12:38:22.075	\N
1f87d70a-7fb5-43e9-a41c-87b29873a33b	SKU-019	Super Sony Dish Wash Soap	super-sony	configurable	\N	\N	20.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:42:28.802	2026-06-17 12:45:08.124	\N
05268a8c-518a-4ff4-8691-3cfdff054382	SKU-021	Dish Wash Scourer	dish-wash-scourer	configurable	\N	\N	50.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:46:19.087	2026-06-17 12:46:19.087	\N
72c84214-a05b-40e8-9093-d76177afd8d9	SKU-009	Toilet Bowl Cleaner	toilet-bowl-cleaner	configurable	\N	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:21:11.493	2026-06-17 13:07:58.153	\N
64289463-e48b-4261-bfef-e59b622eb20e	SKU-004	Viva Beauty Soap	test-product-3	configurable	\N	\N	50.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:50:26.021	2026-06-18 13:21:57.627	\N
0019bc5a-cfda-423a-8033-04e19527878c	SKU-002	Tibet Beauty Soap	test-product-1	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:39.284	2026-06-18 13:25:07.618	\N
eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003	Hand Wash	test-product-2	configurable	\N	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:51.979	2026-06-17 11:59:00.877	\N
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001	Euro Beauty Soap	test-product	configurable	\N	\N	50.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:27.174	2026-06-18 13:25:26.778	\N
2881ef70-d26b-4da5-af06-9e0c5795fee4	SKU-018	Dish Wash Liquid	dish-wash-liquid	configurable	\N	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:40:11.279	2026-06-18 13:25:48.993	\N
90792798-2b85-4423-8eba-e7f12c64617d	SKU-020	777 Sony Dish Wash Soap	777-sony-dish-wash-soap	configurable	\N	\N	20.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:44:43.939	2026-06-19 11:43:07.577	\N
07b2bf6a-2585-42f2-a7fd-ecc432b11861	SKU-015	Cockroach Killer	cockroach-killer	configurable	\N	\N	250.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:34:49.065	2026-06-18 13:26:19.034	\N
2e6248be-15bb-45a8-8dc1-245118193c6f	SKU-005	Khaleej Washing Soap	test-product-4	configurable	\N	\N	50.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:08:05.816	2026-06-17 12:13:55.671	\N
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	SKU-006	Misaal Washing Soap	test-product-5	configurable	\N	\N	60.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:12:32.073	2026-06-17 12:14:14.048	\N
11920e18-2c21-473c-a201-54cfa6870a03	SKU-007	Fatty Brown Washing Soap	fatty-brown-washing-soap	configurable	\N	\N	79.98	\N	\N	active	both	\N	{}	{}	2026-06-17 12:15:17.43	2026-06-17 12:15:17.43	\N
eb72e342-64df-4566-8029-db2c63859130	SKU-008	Perfume Phenyl	perfume-phenyl	configurable	\N	\N	120.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:17:15.615	2026-06-17 12:17:15.615	\N
5eaf65df-0faa-4975-be7b-6a2554a04f13	SKU-010	Tile Wash	tile-wash	configurable	\N	\N	80.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:22:31.314	2026-06-17 12:22:31.314	\N
09cfaa0d-9088-4e2d-823e-3ad80af8853b	SKU-017	Sweep-o Floor & Tile Cleaner	sweep-o-floor-tile-cleaner	configurable	\N	\N	160.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:37:49.797	2026-06-18 13:26:38.403	\N
03e5ef08-6883-4fd0-9583-94a2734aad9a	SKU-014	Panda Liquid Neel	panda-liquid-neel	configurable	\N	\N	69.97	\N	\N	active	both	\N	{}	{}	2026-06-17 12:33:37.963	2026-06-18 13:27:13.556	\N
230f5c47-5d61-4da1-adfc-6aa5d46f7111	SKU-011	Bleach Strong	bleach-cleaner	configurable	\N	\N	80.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:23:50.124	2026-06-18 13:52:16.479	\N
\.


--
-- TOC entry 5526 (class 0 OID 21476)
-- Dependencies: 250
-- Data for Name: promotion_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_customer_groups (id, promotion_id, customer_group_id, is_excluded) FROM stdin;
\.


--
-- TOC entry 5527 (class 0 OID 21486)
-- Dependencies: 251
-- Data for Name: promotion_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_logs (id, promotion_id, cart_id, checkout_id, order_id, customer_id, coupon_code, discount_amount, subtotal_before, subtotal_after, status, metadata, created_at) FROM stdin;
7abc07a9-65b3-47bf-938e-0ff0758d2c35	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	44cfe58a-d167-4b32-9dff-f446edceb156	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	10.00	100.00	90.00	applied	{}	2026-06-18 07:58:09.242
4fd516f7-13ee-4dd1-b967-2749be1a42e8	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	6a953440-2c02-46b2-888b-07831af3e4b5	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	5.00	50.00	45.00	applied	{}	2026-06-18 08:09:20.818
23841703-790a-4f90-a60d-89bb4a1f5323	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	d746b0a1-c8bf-4138-a0fb-2aef0ec911ee	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	490.00	4900.00	4410.00	applied	{}	2026-06-18 08:21:16.244
eedbe9b6-aa37-4b8b-8b61-e0de4cea9941	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	d746b0a1-c8bf-4138-a0fb-2aef0ec911ee	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	485.00	4850.00	4365.00	applied	{}	2026-06-18 08:21:34.438
a46cd928-226e-487c-ad01-c294f68682cd	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	d746b0a1-c8bf-4138-a0fb-2aef0ec911ee	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	440.00	4400.00	3960.00	applied	{}	2026-06-18 08:21:42.949
b21e6869-e4e4-498a-9397-520a3b0d0e7f	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	d746b0a1-c8bf-4138-a0fb-2aef0ec911ee	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	5.00	50.00	45.00	applied	{}	2026-06-18 08:21:55.24
ba59926f-6678-4c64-8d0b-135e64c49076	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	0c428526-f1eb-4864-a84b-d661b026b1fb	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	10.00	100.00	90.00	applied	{}	2026-06-18 09:09:03.022
04df3004-bcd0-4f58-a8f9-faacd6bb9572	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	afcc0bdd-f4d3-4a6f-9b95-40fb3881a856	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	15.90	159.00	143.10	applied	{}	2026-06-18 09:42:40.778
885b0b0b-2890-4de0-bc60-9b68eb57893f	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	bfb2ebb1-4097-40cf-bd9b-ae02bab05c77	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	10.00	100.00	90.00	applied	{}	2026-06-18 09:49:44.499
0cb7ceee-8f1f-4556-a4cd-01428b310a39	e7fc56cd-648e-4d62-8a07-784dfe89a278	\N	397c979f-5467-4161-91ff-8afd37353997	\N	88eba4d4-b784-4d99-9c51-8ad1ac99f3fc	5255	20.00	200.00	180.00	applied	{}	2026-06-19 10:59:14.176
\.


--
-- TOC entry 5528 (class 0 OID 21501)
-- Dependencies: 252
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_products (id, promotion_id, product_id, variant_id, category_id) FROM stdin;
\.


--
-- TOC entry 5529 (class 0 OID 21508)
-- Dependencies: 253
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, code, name, description, type, status, discount_value, discount_type, scope, is_stackable, is_exclusive, applies_to_all_groups, conditions, usage_limit, usage_limit_per_user, current_usage, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
e7fc56cd-648e-4d62-8a07-784dfe89a278	5255	may discount offer	10% off on every product	percentage	active	10.00	percentage	cart	f	t	t	{}	\N	\N	10	\N	\N	{}	2026-05-12 08:15:49.738	2026-06-19 10:59:14.199
\.


--
-- TOC entry 5530 (class 0 OID 21536)
-- Dependencies: 254
-- Data for Name: shipping_method_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_method_customer_groups (id, shipping_method_id, customer_group_id, discount_percent, fixed_cost, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5531 (class 0 OID 21549)
-- Dependencies: 255
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_methods (id, zone_id, code, name, description, type, config, min_order_amount, max_order_amount, min_weight, max_weight, priority, is_active, courier_config, metadata, created_at, updated_at) FROM stdin;
67b1cc73-d1a5-4f53-acd2-a3489f62c963	5c1fd339-aed0-4bdb-9b4c-d6444fb5a6d5	flat-standard	Standard Shipping	\N	flat_rate	{"cost": 100}	\N	\N	\N	\N	0	t	{}	{}	2026-05-04 07:04:16.157	2026-05-04 07:04:16.157
00000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000001	standard	Standard Shipping	Standard delivery	flat_rate	{"cost": 99}	\N	\N	\N	\N	0	t	{}	{}	2026-05-06 11:10:43.414	2026-05-15 05:42:35.156
\.


--
-- TOC entry 5532 (class 0 OID 21571)
-- Dependencies: 256
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_zones (id, name, description, coverage, priority, is_active, metadata, created_at, updated_at) FROM stdin;
5c1fd339-aed0-4bdb-9b4c-d6444fb5a6d5	STANDARD	standard zone	{"countries": ["PK"]}	10	t	{}	2026-05-04 07:03:53.831	2026-05-04 07:03:53.831
00000000-0000-0000-0000-000000000001	Default	Default zone for all addresses	{}	0	t	{}	2026-05-06 11:10:43.28	2026-05-06 11:10:43.28
\.


--
-- TOC entry 5533 (class 0 OID 21589)
-- Dependencies: 257
-- Data for Name: storefront_filter_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_options (id, filter_id, value, label, sort_order, is_active, created_at, updated_at) FROM stdin;
132df047-8d87-46ec-b55f-ad2ca79d3e77	a3468826-90b7-40c6-88fc-066b761374f4	Orchid	\N	1	t	2026-06-18 14:30:28.376	2026-06-18 14:30:28.376
44c734f8-56cb-4c97-8594-26922c00184a	a3468826-90b7-40c6-88fc-066b761374f4	Rose	\N	2	t	2026-06-18 14:30:40.325	2026-06-18 14:30:40.325
d527341d-5386-452e-b412-6cd1fccabcdf	a3468826-90b7-40c6-88fc-066b761374f4	White	\N	3	t	2026-06-18 14:30:46.898	2026-06-18 14:30:46.898
ccda4690-538d-4c93-87e6-6ffc4ef782ab	a3468826-90b7-40c6-88fc-066b761374f4	Pink Lily	Pink Lily	0	t	2026-06-18 14:30:16.859	2026-06-18 14:35:45.146
\.


--
-- TOC entry 5534 (class 0 OID 21604)
-- Dependencies: 258
-- Data for Name: storefront_filter_tree_nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_tree_nodes (id, filter_id, parent_id, nav_link_id, sort_order, is_active, created_at, updated_at) FROM stdin;
f7a1a7a5-7f43-4221-af6d-7157c5257d8a	5137f006-f68a-4341-84a0-241fb12c98bb	\N	3509717e-86ed-4d2b-967d-a05d27ce9803	0	t	2026-06-18 14:32:06.917	2026-06-18 14:32:32.103
00996cc3-1cbc-4db4-88d2-7186a465c1ef	5137f006-f68a-4341-84a0-241fb12c98bb	\N	6f6c4165-e162-4ebd-ad78-987a42165c3a	1	t	2026-06-18 14:32:06.922	2026-06-18 14:32:32.105
052fca55-ec7a-42bd-9773-74e178195f06	5137f006-f68a-4341-84a0-241fb12c98bb	\N	2c47212c-1930-4afc-b697-68c49aa95b8b	2	t	2026-06-18 14:32:06.924	2026-06-18 14:32:32.107
b62f854f-578e-46ab-af32-13d3ee9ed88e	5137f006-f68a-4341-84a0-241fb12c98bb	f7a1a7a5-7f43-4221-af6d-7157c5257d8a	e32719a8-318c-4128-95d2-e7a3fd2114b7	0	f	2026-06-18 14:32:06.928	2026-06-18 14:32:53.571
432311d0-dc07-47a0-814d-035cc67d9f76	5137f006-f68a-4341-84a0-241fb12c98bb	f7a1a7a5-7f43-4221-af6d-7157c5257d8a	81d8f5e2-1c54-491f-ab15-66531ce3d9f3	1	f	2026-06-18 14:32:06.933	2026-06-18 14:32:55.684
c41565e4-2dc1-4105-bb08-ade348991a86	5137f006-f68a-4341-84a0-241fb12c98bb	f7a1a7a5-7f43-4221-af6d-7157c5257d8a	4c2bb66a-2a63-4131-9f8c-3d3bebf60a1c	2	f	2026-06-18 14:32:06.936	2026-06-18 14:32:57.524
1531d208-5fd3-4179-8719-845c00329126	5137f006-f68a-4341-84a0-241fb12c98bb	f7a1a7a5-7f43-4221-af6d-7157c5257d8a	51f9b104-db07-42e4-aa66-6b65e56b01d6	3	f	2026-06-18 14:32:06.942	2026-06-18 14:32:59.388
e68e0502-21a6-44ed-81a7-ef5b8febc0ef	5137f006-f68a-4341-84a0-241fb12c98bb	f7a1a7a5-7f43-4221-af6d-7157c5257d8a	6dd5c856-46c7-475b-a145-664ec5fbc134	4	f	2026-06-18 14:32:06.944	2026-06-18 14:33:03.761
424828f0-1635-45f2-878c-d8d0c1ecfc64	5137f006-f68a-4341-84a0-241fb12c98bb	00996cc3-1cbc-4db4-88d2-7186a465c1ef	e470e2bf-0acb-4cc6-8651-49b7154e25fe	0	f	2026-06-18 14:32:06.925	2026-06-18 14:33:13.286
55d68d01-d173-459c-85f1-e9bbe272b468	5137f006-f68a-4341-84a0-241fb12c98bb	00996cc3-1cbc-4db4-88d2-7186a465c1ef	8a0a4887-c075-4284-819d-3c2d6b0c4832	1	f	2026-06-18 14:32:06.932	2026-06-18 14:33:14.611
d6174c29-5dad-46f9-9f7c-5b4f7d20ad88	5137f006-f68a-4341-84a0-241fb12c98bb	00996cc3-1cbc-4db4-88d2-7186a465c1ef	fd7d6120-89fa-4ce4-a7d7-17bbf97a945c	2	f	2026-06-18 14:32:06.935	2026-06-18 14:33:15.73
624c575c-55f7-49f9-bf1c-44d64adceba1	5137f006-f68a-4341-84a0-241fb12c98bb	00996cc3-1cbc-4db4-88d2-7186a465c1ef	129d7bfb-c80b-4796-ab26-992b09bc02f1	3	f	2026-06-18 14:32:06.94	2026-06-18 14:33:16.979
34273bee-a49e-4cf7-948f-f4bec3dd2293	5137f006-f68a-4341-84a0-241fb12c98bb	052fca55-ec7a-42bd-9773-74e178195f06	c321a5fa-2fdb-4370-be83-1898acfb9828	0	f	2026-06-18 14:32:06.927	2026-06-18 14:33:19.377
7c28f579-e8b1-45ff-ab67-9799fd0e3ac6	5137f006-f68a-4341-84a0-241fb12c98bb	052fca55-ec7a-42bd-9773-74e178195f06	18280818-a3d3-4764-8a0d-b5952e04db68	1	f	2026-06-18 14:32:06.93	2026-06-18 14:33:20.384
e993aa62-a0e8-4762-a135-d5adbbb3b79f	5137f006-f68a-4341-84a0-241fb12c98bb	052fca55-ec7a-42bd-9773-74e178195f06	fb69a8e5-27c1-4293-ba49-c190a5f3c738	2	f	2026-06-18 14:32:06.938	2026-06-18 14:33:22.12
d1ff12b8-6662-4cf2-831d-5605e30dd145	5137f006-f68a-4341-84a0-241fb12c98bb	052fca55-ec7a-42bd-9773-74e178195f06	11324017-cb95-4c53-ac73-809dbc28c0f7	3	f	2026-06-18 14:32:06.939	2026-06-18 14:33:22.839
70dfa5c3-983b-4856-9e7c-dc638dbcb037	5137f006-f68a-4341-84a0-241fb12c98bb	052fca55-ec7a-42bd-9773-74e178195f06	787a22e1-6bda-4dc3-b405-ebde165b4a73	4	f	2026-06-18 14:32:06.943	2026-06-18 14:33:23.279
\.


--
-- TOC entry 5535 (class 0 OID 21616)
-- Dependencies: 259
-- Data for Name: storefront_filters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filters (id, code, name, kind, sort_order, is_active, created_at, updated_at) FROM stdin;
a3468826-90b7-40c6-88fc-066b761374f4	flavours	Flavours	ATTRIBUTE	0	t	2026-06-18 14:29:57.681	2026-06-18 14:29:57.681
1925e01b-2ad9-4c5f-a59b-ca0d381c9e5d	price	Price	PRICE	0	t	2026-06-18 14:31:12.351	2026-06-18 14:31:23.834
5137f006-f68a-4341-84a0-241fb12c98bb	category	Category	CATEGORY	0	t	2026-06-18 14:32:00.577	2026-06-18 14:32:00.577
\.


--
-- TOC entry 5536 (class 0 OID 21630)
-- Dependencies: 260
-- Data for Name: storefront_nav_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_nav_links (id, label, secondary_label, href, sort_order, is_active, kind, created_at, updated_at, zone, parent_id, category_id, open_mega_menu, banner_image_url, banner_href, banner_alt) FROM stdin;
00000000-0000-0000-0000-00000000e001	Home	\N	/	0	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e003	Track order	\N	/track-order	20	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e005	Cart	\N	/cart	40	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
e32719a8-318c-4128-95d2-e7a3fd2114b7	Viva Beauty Soap	\N	http://localhost:3001/products/test-product-3	0	t	LINK	2026-05-14 06:10:17.76	2026-06-17 12:49:28.016	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
81d8f5e2-1c54-491f-ab15-66531ce3d9f3	Tibet Beauty Soap	\N	http://localhost:3001/products/test-product-1	1	t	LINK	2026-05-14 06:10:32.81	2026-06-17 12:49:59.618	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
4c2bb66a-2a63-4131-9f8c-3d3bebf60a1c	Euro Beauty Soap	\N	http://localhost:3001/products/test-product	2	t	LINK	2026-05-14 06:10:44.534	2026-06-17 12:50:30.683	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
6f6c4165-e162-4ebd-ad78-987a42165c3a	Dish Wash Items	\N	/	1	t	LINK	2026-05-13 10:44:23.917	2026-06-17 12:51:29.87	mega	\N	\N	f	\N	\N	\N
e470e2bf-0acb-4cc6-8651-49b7154e25fe	Dish Wash Liquid	\N	http://localhost:3001/products/dish-wash-liquid	0	t	LINK	2026-05-13 10:44:41.631	2026-06-17 12:51:58.608	mega	6f6c4165-e162-4ebd-ad78-987a42165c3a	\N	f	\N	\N	\N
8a0a4887-c075-4284-819d-3c2d6b0c4832	Super Sony Dish Wash Soap	\N	http://localhost:3001/products/super-sony	1	t	LINK	2026-05-14 06:12:00.063	2026-06-17 12:52:31.49	mega	6f6c4165-e162-4ebd-ad78-987a42165c3a	\N	f	\N	\N	\N
fd7d6120-89fa-4ce4-a7d7-17bbf97a945c	777 Sony Dish Wash Soap	\N	http://localhost:3001/products/777-sony-dish-wash-soap	2	t	LINK	2026-06-17 12:53:21.876	2026-06-17 12:53:21.876	mega	6f6c4165-e162-4ebd-ad78-987a42165c3a	\N	f	\N	\N	\N
129d7bfb-c80b-4796-ab26-992b09bc02f1	Dish Wash Steel Scourer	\N	http://localhost:3001/products/dish-wash-scourer	3	t	LINK	2026-06-17 12:54:09.14	2026-06-17 12:54:09.14	mega	6f6c4165-e162-4ebd-ad78-987a42165c3a	\N	f	\N	\N	\N
2c47212c-1930-4afc-b697-68c49aa95b8b	Home Cleaning Items	\N	/	2	t	LINK	2026-05-13 10:40:56.931	2026-06-17 12:55:26.355	mega	\N	\N	f	\N	\N	\N
c321a5fa-2fdb-4370-be83-1898acfb9828	Perfume Phenyl	\N	http://localhost:3001/products/perfume-phenyl	0	t	LINK	2026-05-13 10:41:15.89	2026-06-17 12:56:15.729	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
18280818-a3d3-4764-8a0d-b5952e04db68	Panda Perfume Phenyl	\N	http://localhost:3001/products/panda-perfume-phenyl	1	t	LINK	2026-05-13 10:41:43.833	2026-06-17 12:57:03.247	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
fb69a8e5-27c1-4293-ba49-c190a5f3c738	Hand Wash	\N	http://localhost:3001/products/test-product-2	2	t	LINK	2026-05-13 10:41:59.442	2026-06-17 12:57:25.555	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
11324017-cb95-4c53-ac73-809dbc28c0f7	Clean 360 Glass Cleaner	\N	http://localhost:3001/products/glass-cleaner-clean-360	3	t	LINK	2026-06-17 12:58:02.228	2026-06-17 12:58:02.228	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
787a22e1-6bda-4dc3-b405-ebde165b4a73	Cockroach Killer	\N	http://localhost:3001/products/cockroach-killer	4	t	LINK	2026-06-17 12:59:09.457	2026-06-17 12:59:09.457	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
3509717e-86ed-4d2b-967d-a05d27ce9803	Soaps	\N	/	0	t	LINK	2026-05-14 06:09:17.438	2026-06-17 12:59:23.925	mega	\N	\N	f	\N	\N	\N
51f9b104-db07-42e4-aa66-6b65e56b01d6	Khaleej Washing Soap	\N	http://localhost:3001/products/test-product-4	3	t	LINK	2026-06-17 13:00:06.696	2026-06-17 13:00:06.696	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
6dd5c856-46c7-475b-a145-664ec5fbc134	Misaal Washing Soap	\N	http://localhost:3001/products/test-product-5	4	t	LINK	2026-06-17 13:00:29.486	2026-06-17 13:00:29.486	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e002	Products	Categories	/products	10	t	LINK	2026-05-13 11:15:47.684	2026-06-17 13:01:32.48	header	\N	\N	t	http://localhost:3000/uploads/storefront-nav/19b2798d-0bbc-4873-885a-40364c3023c2.jpeg	\N	\N
\.


--
-- TOC entry 5537 (class 0 OID 21652)
-- Dependencies: 261
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, email, source, created_at, updated_at) FROM stdin;
a250fe70-372b-4bb2-95cc-da0e7154c67f	smhuzaifa525@gmail.com	account	2026-05-12 07:44:19.981	2026-05-12 07:44:19.981
\.


--
-- TOC entry 5538 (class 0 OID 21660)
-- Dependencies: 262
-- Data for Name: tax_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_classes (id, code, name, description, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5539 (class 0 OID 21673)
-- Dependencies: 263
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taxes (id, tax_class_id, country, region, rate, is_inclusive, is_active, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5540 (class 0 OID 21691)
-- Dependencies: 264
-- Data for Name: variant_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variant_option_values (variant_id, option_id, value_id) FROM stdin;
58daf9a0-a0ab-4273-b449-e6a076fc9acc	a39db598-111e-4007-bf54-f564b2c1f587	d79e5779-4b44-422c-bcb0-43743dba8196
fdf241e4-b0d0-456e-8da6-eef5c1124666	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
c36c179e-c2af-4e00-beea-dfd8a3cdec2c	59574408-864b-4fb3-a08f-5ee2211a8ba1	edcb2d16-3ef8-46ed-84c0-b55925836025
663e25b8-ac9e-4892-b47c-c2e9514ef716	59574408-864b-4fb3-a08f-5ee2211a8ba1	adda47fd-5c46-4ebf-8a6e-133548aba59e
80c8d8b5-ebed-42d3-aca4-9611d4585f71	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
b85f7fa3-cb5b-4754-8399-6f792a3bf635	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
b0d59239-7b73-492b-8cf8-d0ddba9b5d2e	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
cd8e05c4-96f5-488b-aa34-74083d3e2978	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
cd8e05c4-96f5-488b-aa34-74083d3e2978	906abee1-8c7f-4645-8193-973989132503	82b87405-7303-4194-8470-0b74022faa4c
ad533fd1-8637-4268-bf5c-c8dcd1febdc6	59574408-864b-4fb3-a08f-5ee2211a8ba1	edcb2d16-3ef8-46ed-84c0-b55925836025
ad533fd1-8637-4268-bf5c-c8dcd1febdc6	906abee1-8c7f-4645-8193-973989132503	82b87405-7303-4194-8470-0b74022faa4c
34eddf36-827a-4247-9037-4af9dae3a462	59574408-864b-4fb3-a08f-5ee2211a8ba1	adda47fd-5c46-4ebf-8a6e-133548aba59e
34eddf36-827a-4247-9037-4af9dae3a462	906abee1-8c7f-4645-8193-973989132503	82b87405-7303-4194-8470-0b74022faa4c
3fcd3a63-0d69-4368-8078-4094c1f0d595	59574408-864b-4fb3-a08f-5ee2211a8ba1	d1f00583-8325-4de2-8d03-13e550682edd
3fcd3a63-0d69-4368-8078-4094c1f0d595	906abee1-8c7f-4645-8193-973989132503	82b87405-7303-4194-8470-0b74022faa4c
f48488c2-d01c-47a1-98f2-8073d9f103db	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
3ddee9a7-cbf0-4ce6-9f0a-1b71cf16d076	a39db598-111e-4007-bf54-f564b2c1f587	b7624b89-1245-4380-936f-3ec1cc995001
e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
4e7ea113-5c3c-4315-96f5-357735682caa	906abee1-8c7f-4645-8193-973989132503	f56ce2c9-7e87-4eaf-8588-d6c8822a106e
480fc5fd-9198-4c2f-ae38-8a0b052a9313	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	906abee1-8c7f-4645-8193-973989132503	0f01dc86-2798-4ffb-9902-663a759b845e
efbf85a4-a7b1-4ead-83db-4c7df04e3790	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
48de193f-546c-4de8-b665-15e8cab49584	a39db598-111e-4007-bf54-f564b2c1f587	a2203e30-f48b-48d9-8a20-f17b52937ced
120f37f1-42aa-45c0-b801-4731330886e3	a39db598-111e-4007-bf54-f564b2c1f587	a2203e30-f48b-48d9-8a20-f17b52937ced
81b62a2b-ca50-48c2-8ee7-3628ab91a7a1	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
5c75a449-39e0-4ec7-a6ff-d11dbb9f2d08	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
85511305-b97c-4697-9e60-1ebb4ef4e0de	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
a0f519b2-b535-41bb-abae-c7bf57b39e4c	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
f44c87d3-ea38-4329-bad9-b0a72e4d955d	59574408-864b-4fb3-a08f-5ee2211a8ba1	30d60dcc-867c-4fbd-a208-4aef88480725
76e0bd60-36da-44ae-bff0-dd87635ce982	59574408-864b-4fb3-a08f-5ee2211a8ba1	0bb4c7bc-d181-4c9a-869e-4aeae5df4031
ec4803c2-6aa6-452c-aa1a-e23d0271d115	59574408-864b-4fb3-a08f-5ee2211a8ba1	0c67d0de-3c86-4047-b10c-fea938d735d5
698b25db-dba8-4445-904d-42c73dccab7c	59574408-864b-4fb3-a08f-5ee2211a8ba1	0888e912-f7f3-466c-9603-d8958d9b139f
698b25db-dba8-4445-904d-42c73dccab7c	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
24501ee4-c6e2-4123-927b-6cf3566f0acf	59574408-864b-4fb3-a08f-5ee2211a8ba1	0888e912-f7f3-466c-9603-d8958d9b139f
24501ee4-c6e2-4123-927b-6cf3566f0acf	a39db598-111e-4007-bf54-f564b2c1f587	ff90c3cc-146f-4def-8f27-2ea350291c61
c040a4a6-e6c4-42dd-b718-a0f40b02badc	59574408-864b-4fb3-a08f-5ee2211a8ba1	fcdd232c-7426-4e25-b32f-df5103b7f511
c040a4a6-e6c4-42dd-b718-a0f40b02badc	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
44336f06-9b4d-4dd5-a651-c707a9bbc34a	59574408-864b-4fb3-a08f-5ee2211a8ba1	fcdd232c-7426-4e25-b32f-df5103b7f511
44336f06-9b4d-4dd5-a651-c707a9bbc34a	a39db598-111e-4007-bf54-f564b2c1f587	ff90c3cc-146f-4def-8f27-2ea350291c61
d1c1d523-51e8-43c4-a7cc-b8028c68a645	59574408-864b-4fb3-a08f-5ee2211a8ba1	5c00a20f-7157-4e94-9797-eb233b0f8c48
d1c1d523-51e8-43c4-a7cc-b8028c68a645	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
733b396a-9b08-4190-b3c4-5ab6ee899cac	59574408-864b-4fb3-a08f-5ee2211a8ba1	5c00a20f-7157-4e94-9797-eb233b0f8c48
733b396a-9b08-4190-b3c4-5ab6ee899cac	a39db598-111e-4007-bf54-f564b2c1f587	ff90c3cc-146f-4def-8f27-2ea350291c61
77cde620-dc5a-4d4b-9248-26b8b31ad58a	59574408-864b-4fb3-a08f-5ee2211a8ba1	11eca007-82d2-44d8-b07c-b9aad4ed0ec4
77cde620-dc5a-4d4b-9248-26b8b31ad58a	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
531d2a81-91cf-4868-bc07-9319aca112fd	59574408-864b-4fb3-a08f-5ee2211a8ba1	11eca007-82d2-44d8-b07c-b9aad4ed0ec4
531d2a81-91cf-4868-bc07-9319aca112fd	a39db598-111e-4007-bf54-f564b2c1f587	ff90c3cc-146f-4def-8f27-2ea350291c61
9de378fb-d5bc-4d5b-bf8a-5e1f10318aa1	59574408-864b-4fb3-a08f-5ee2211a8ba1	f34de9c0-5dd7-48b1-bef4-9b8f72f95a86
9de378fb-d5bc-4d5b-bf8a-5e1f10318aa1	a39db598-111e-4007-bf54-f564b2c1f587	12e6652f-be05-405f-8647-8cc760628251
cc51d3af-bbfc-420d-8122-96c69eba6b3a	59574408-864b-4fb3-a08f-5ee2211a8ba1	f34de9c0-5dd7-48b1-bef4-9b8f72f95a86
cc51d3af-bbfc-420d-8122-96c69eba6b3a	a39db598-111e-4007-bf54-f564b2c1f587	ff90c3cc-146f-4def-8f27-2ea350291c61
dab15350-43b5-4b34-b7b5-19109578dfb6	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
\.


--
-- TOC entry 5069 (class 2606 OID 21700)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 21702)
-- Name: account_creation_tokens account_creation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_creation_tokens
    ADD CONSTRAINT account_creation_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 21704)
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5080 (class 2606 OID 21706)
-- Name: admin_role_permissions admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5082 (class 2606 OID 21708)
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5085 (class 2606 OID 21710)
-- Name: admin_user_roles admin_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 5090 (class 2606 OID 21712)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5094 (class 2606 OID 21714)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5100 (class 2606 OID 21716)
-- Name: cms_banner_sliders cms_banner_sliders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_sliders
    ADD CONSTRAINT cms_banner_sliders_pkey PRIMARY KEY (id);


--
-- TOC entry 5102 (class 2606 OID 21718)
-- Name: cms_banner_slides cms_banner_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 21720)
-- Name: cms_blocks cms_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_blocks
    ADD CONSTRAINT cms_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5110 (class 2606 OID 21722)
-- Name: cms_pages cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_pages
    ADD CONSTRAINT cms_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 21724)
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 21726)
-- Name: customer_groups customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_groups
    ADD CONSTRAINT customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5128 (class 2606 OID 21728)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 5133 (class 2606 OID 21730)
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5139 (class 2606 OID 21732)
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 5143 (class 2606 OID 21734)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5149 (class 2606 OID 21736)
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- TOC entry 5156 (class 2606 OID 21738)
-- Name: order_taxes order_taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5164 (class 2606 OID 21740)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5170 (class 2606 OID 21742)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5177 (class 2606 OID 21744)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5181 (class 2606 OID 21746)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- TOC entry 5184 (class 2606 OID 21748)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5195 (class 2606 OID 21750)
-- Name: product_option_values_on_products product_option_values_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_pkey PRIMARY KEY (product_id, option_id, value_id);


--
-- TOC entry 5193 (class 2606 OID 21752)
-- Name: product_option_values product_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_pkey PRIMARY KEY (id);


--
-- TOC entry 5205 (class 2606 OID 21754)
-- Name: product_options_on_products product_options_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_pkey PRIMARY KEY (product_id, option_id);


--
-- TOC entry 5202 (class 2606 OID 21756)
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5209 (class 2606 OID 21758)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5214 (class 2606 OID 21760)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5223 (class 2606 OID 21762)
-- Name: promotion_customer_groups promotion_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5234 (class 2606 OID 21764)
-- Name: promotion_logs promotion_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5238 (class 2606 OID 21766)
-- Name: promotion_products promotion_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_pkey PRIMARY KEY (id);


--
-- TOC entry 5245 (class 2606 OID 21768)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 5251 (class 2606 OID 21770)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5257 (class 2606 OID 21772)
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5262 (class 2606 OID 21774)
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5267 (class 2606 OID 21776)
-- Name: storefront_filter_options storefront_filter_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5272 (class 2606 OID 21778)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_pkey PRIMARY KEY (id);


--
-- TOC entry 5276 (class 2606 OID 21780)
-- Name: storefront_filters storefront_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filters
    ADD CONSTRAINT storefront_filters_pkey PRIMARY KEY (id);


--
-- TOC entry 5279 (class 2606 OID 21782)
-- Name: storefront_nav_links storefront_nav_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5284 (class 2606 OID 21784)
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 5288 (class 2606 OID 21786)
-- Name: tax_classes tax_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_classes
    ADD CONSTRAINT tax_classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5293 (class 2606 OID 21788)
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5298 (class 2606 OID 21790)
-- Name: variant_option_values variant_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_pkey PRIMARY KEY (variant_id, option_id);


--
-- TOC entry 5070 (class 1259 OID 21791)
-- Name: account_creation_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_email_idx ON public.account_creation_tokens USING btree (email);


--
-- TOC entry 5071 (class 1259 OID 21792)
-- Name: account_creation_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_expires_at_idx ON public.account_creation_tokens USING btree (expires_at);


--
-- TOC entry 5074 (class 1259 OID 21793)
-- Name: account_creation_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_token_idx ON public.account_creation_tokens USING btree (token);


--
-- TOC entry 5075 (class 1259 OID 21794)
-- Name: account_creation_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX account_creation_tokens_token_key ON public.account_creation_tokens USING btree (token);


--
-- TOC entry 5076 (class 1259 OID 21795)
-- Name: admin_permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_permissions_key_key ON public.admin_permissions USING btree (key);


--
-- TOC entry 5083 (class 1259 OID 21796)
-- Name: admin_roles_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_roles_slug_key ON public.admin_roles USING btree (slug);


--
-- TOC entry 5086 (class 1259 OID 21797)
-- Name: admin_users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_email_idx ON public.admin_users USING btree (email);


--
-- TOC entry 5087 (class 1259 OID 21798)
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- TOC entry 5088 (class 1259 OID 21799)
-- Name: admin_users_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_is_active_idx ON public.admin_users USING btree (is_active);


--
-- TOC entry 5091 (class 1259 OID 21800)
-- Name: categories_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_is_active_idx ON public.categories USING btree (is_active);


--
-- TOC entry 5092 (class 1259 OID 21801)
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);


--
-- TOC entry 5095 (class 1259 OID 21802)
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- TOC entry 5096 (class 1259 OID 21803)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 5097 (class 1259 OID 21804)
-- Name: cms_banner_sliders_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_sliders_identifier_is_active_idx ON public.cms_banner_sliders USING btree (identifier, is_active);


--
-- TOC entry 5098 (class 1259 OID 21805)
-- Name: cms_banner_sliders_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_banner_sliders_identifier_key ON public.cms_banner_sliders USING btree (identifier);


--
-- TOC entry 5103 (class 1259 OID 21806)
-- Name: cms_banner_slides_slider_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_is_active_idx ON public.cms_banner_slides USING btree (slider_id, is_active);


--
-- TOC entry 5104 (class 1259 OID 21807)
-- Name: cms_banner_slides_slider_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_sort_order_idx ON public.cms_banner_slides USING btree (slider_id, sort_order);


--
-- TOC entry 5105 (class 1259 OID 21808)
-- Name: cms_blocks_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_blocks_identifier_is_active_idx ON public.cms_blocks USING btree (identifier, is_active);


--
-- TOC entry 5106 (class 1259 OID 21809)
-- Name: cms_blocks_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_blocks_identifier_key ON public.cms_blocks USING btree (identifier);


--
-- TOC entry 5111 (class 1259 OID 21810)
-- Name: cms_pages_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_pages_slug_key ON public.cms_pages USING btree (slug);


--
-- TOC entry 5112 (class 1259 OID 21811)
-- Name: cms_pages_slug_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_slug_status_idx ON public.cms_pages USING btree (slug, status);


--
-- TOC entry 5113 (class 1259 OID 21812)
-- Name: cms_pages_status_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_status_updated_at_idx ON public.cms_pages USING btree (status, updated_at DESC);


--
-- TOC entry 5114 (class 1259 OID 21813)
-- Name: customer_addresses_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_addresses_customer_id_idx ON public.customer_addresses USING btree (customer_id);


--
-- TOC entry 5117 (class 1259 OID 21814)
-- Name: customer_groups_is_default_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_is_default_idx ON public.customer_groups USING btree (is_default);


--
-- TOC entry 5120 (class 1259 OID 21815)
-- Name: customer_groups_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_tax_class_id_idx ON public.customer_groups USING btree (tax_class_id);


--
-- TOC entry 5121 (class 1259 OID 21816)
-- Name: customers_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_customer_group_id_idx ON public.customers USING btree (customer_group_id);


--
-- TOC entry 5122 (class 1259 OID 21817)
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- TOC entry 5123 (class 1259 OID 21818)
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- TOC entry 5124 (class 1259 OID 22170)
-- Name: customers_email_verification_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_verification_token_idx ON public.customers USING btree (email_verification_token);


--
-- TOC entry 5125 (class 1259 OID 22169)
-- Name: customers_email_verification_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_verification_token_key ON public.customers USING btree (email_verification_token);


--
-- TOC entry 5126 (class 1259 OID 21819)
-- Name: customers_is_guest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_is_guest_idx ON public.customers USING btree (is_guest);


--
-- TOC entry 5129 (class 1259 OID 22172)
-- Name: customers_reset_password_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_reset_password_token_idx ON public.customers USING btree (reset_password_token);


--
-- TOC entry 5130 (class 1259 OID 22171)
-- Name: customers_reset_password_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_reset_password_token_key ON public.customers USING btree (reset_password_token);


--
-- TOC entry 5131 (class 1259 OID 21820)
-- Name: inventory_items_available_quantity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_available_quantity_idx ON public.inventory_items USING btree (available_quantity);


--
-- TOC entry 5134 (class 1259 OID 21821)
-- Name: inventory_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_product_id_idx ON public.inventory_items USING btree (product_id);


--
-- TOC entry 5135 (class 1259 OID 21822)
-- Name: inventory_items_product_id_variant_id_warehouse_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inventory_items_product_id_variant_id_warehouse_id_key ON public.inventory_items USING btree (product_id, variant_id, warehouse_id);


--
-- TOC entry 5136 (class 1259 OID 21823)
-- Name: inventory_items_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_variant_id_idx ON public.inventory_items USING btree (variant_id);


--
-- TOC entry 5137 (class 1259 OID 21824)
-- Name: inventory_reservations_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_expires_at_idx ON public.inventory_reservations USING btree (expires_at);


--
-- TOC entry 5140 (class 1259 OID 21825)
-- Name: inventory_reservations_reference_type_reference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_reference_type_reference_id_idx ON public.inventory_reservations USING btree (reference_type, reference_id);


--
-- TOC entry 5141 (class 1259 OID 21826)
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- TOC entry 5144 (class 1259 OID 21827)
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- TOC entry 5145 (class 1259 OID 21828)
-- Name: order_shipping_courier_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_courier_code_idx ON public.order_shipping USING btree (courier_code);


--
-- TOC entry 5146 (class 1259 OID 21829)
-- Name: order_shipping_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_order_id_idx ON public.order_shipping USING btree (order_id);


--
-- TOC entry 5147 (class 1259 OID 21830)
-- Name: order_shipping_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX order_shipping_order_id_key ON public.order_shipping USING btree (order_id);


--
-- TOC entry 5150 (class 1259 OID 21831)
-- Name: order_shipping_shipped_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipped_at_idx ON public.order_shipping USING btree (shipped_at);


--
-- TOC entry 5151 (class 1259 OID 21832)
-- Name: order_shipping_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipping_method_id_idx ON public.order_shipping USING btree (shipping_method_id);


--
-- TOC entry 5152 (class 1259 OID 21833)
-- Name: order_shipping_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_status_idx ON public.order_shipping USING btree (status);


--
-- TOC entry 5153 (class 1259 OID 21834)
-- Name: order_shipping_tracking_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_tracking_number_idx ON public.order_shipping USING btree (tracking_number);


--
-- TOC entry 5154 (class 1259 OID 21835)
-- Name: order_taxes_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_order_id_idx ON public.order_taxes USING btree (order_id);


--
-- TOC entry 5157 (class 1259 OID 21836)
-- Name: order_taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_class_id_idx ON public.order_taxes USING btree (tax_class_id);


--
-- TOC entry 5158 (class 1259 OID 21837)
-- Name: order_taxes_tax_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_id_idx ON public.order_taxes USING btree (tax_id);


--
-- TOC entry 5159 (class 1259 OID 21838)
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at DESC);


--
-- TOC entry 5160 (class 1259 OID 21839)
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- TOC entry 5161 (class 1259 OID 21840)
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- TOC entry 5162 (class 1259 OID 21841)
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- TOC entry 5165 (class 1259 OID 21842)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 5166 (class 1259 OID 21843)
-- Name: payment_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_code_idx ON public.payment_methods USING btree (code);


--
-- TOC entry 5167 (class 1259 OID 21844)
-- Name: payment_methods_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_methods_code_key ON public.payment_methods USING btree (code);


--
-- TOC entry 5168 (class 1259 OID 21845)
-- Name: payment_methods_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_is_active_idx ON public.payment_methods USING btree (is_active);


--
-- TOC entry 5171 (class 1259 OID 21846)
-- Name: payment_methods_provider_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_provider_idx ON public.payment_methods USING btree (provider);


--
-- TOC entry 5172 (class 1259 OID 21847)
-- Name: payments_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_created_at_idx ON public.payments USING btree (created_at DESC);


--
-- TOC entry 5173 (class 1259 OID 21848)
-- Name: payments_gateway_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_gateway_transaction_id_idx ON public.payments USING btree (gateway_transaction_id);


--
-- TOC entry 5174 (class 1259 OID 21849)
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_order_id_idx ON public.payments USING btree (order_id);


--
-- TOC entry 5175 (class 1259 OID 21850)
-- Name: payments_payment_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_method_id_idx ON public.payments USING btree (payment_method_id);


--
-- TOC entry 5178 (class 1259 OID 21851)
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- TOC entry 5179 (class 1259 OID 21852)
-- Name: product_categories_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_category_id_idx ON public.product_categories USING btree (category_id);


--
-- TOC entry 5182 (class 1259 OID 21853)
-- Name: product_categories_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_product_id_idx ON public.product_categories USING btree (product_id);


--
-- TOC entry 5185 (class 1259 OID 21854)
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- TOC entry 5186 (class 1259 OID 21855)
-- Name: product_images_product_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_is_primary_idx ON public.product_images USING btree (product_id, is_primary);


--
-- TOC entry 5187 (class 1259 OID 21856)
-- Name: product_images_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_idx ON public.product_images USING btree (variant_id);


--
-- TOC entry 5188 (class 1259 OID 21857)
-- Name: product_images_variant_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_is_primary_idx ON public.product_images USING btree (variant_id, is_primary);


--
-- TOC entry 5189 (class 1259 OID 21858)
-- Name: product_option_values_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_is_active_idx ON public.product_option_values USING btree (is_active);


--
-- TOC entry 5196 (class 1259 OID 21859)
-- Name: product_option_values_on_products_product_id_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_product_id_option_id_idx ON public.product_option_values_on_products USING btree (product_id, option_id);


--
-- TOC entry 5197 (class 1259 OID 21860)
-- Name: product_option_values_on_products_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_value_id_idx ON public.product_option_values_on_products USING btree (value_id);


--
-- TOC entry 5190 (class 1259 OID 21861)
-- Name: product_option_values_option_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_option_id_sort_order_idx ON public.product_option_values USING btree (option_id, sort_order);


--
-- TOC entry 5191 (class 1259 OID 21862)
-- Name: product_option_values_option_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_option_values_option_id_value_key ON public.product_option_values USING btree (option_id, value);


--
-- TOC entry 5198 (class 1259 OID 21863)
-- Name: product_options_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_code_idx ON public.product_options USING btree (code);


--
-- TOC entry 5199 (class 1259 OID 21864)
-- Name: product_options_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_options_code_key ON public.product_options USING btree (code);


--
-- TOC entry 5200 (class 1259 OID 21865)
-- Name: product_options_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_is_active_idx ON public.product_options USING btree (is_active);


--
-- TOC entry 5203 (class 1259 OID 21866)
-- Name: product_options_on_products_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_option_id_idx ON public.product_options_on_products USING btree (option_id);


--
-- TOC entry 5206 (class 1259 OID 21867)
-- Name: product_options_on_products_product_id_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_product_id_position_idx ON public.product_options_on_products USING btree (product_id, "position");


--
-- TOC entry 5207 (class 1259 OID 21868)
-- Name: product_variants_is_active_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_is_active_product_id_idx ON public.product_variants USING btree (is_active, product_id);


--
-- TOC entry 5210 (class 1259 OID 21869)
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- TOC entry 5211 (class 1259 OID 21870)
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- TOC entry 5212 (class 1259 OID 21871)
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- TOC entry 5215 (class 1259 OID 21872)
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- TOC entry 5216 (class 1259 OID 21873)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5217 (class 1259 OID 21874)
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- TOC entry 5218 (class 1259 OID 21875)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 5219 (class 1259 OID 21876)
-- Name: products_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_deleted_at_idx ON public.products USING btree (status, deleted_at);


--
-- TOC entry 5220 (class 1259 OID 21877)
-- Name: products_visibility_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_visibility_status_deleted_at_idx ON public.products USING btree (visibility, status, deleted_at);


--
-- TOC entry 5221 (class 1259 OID 21878)
-- Name: promotion_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_customer_group_id_idx ON public.promotion_customer_groups USING btree (customer_group_id);


--
-- TOC entry 5224 (class 1259 OID 21879)
-- Name: promotion_customer_groups_promotion_id_customer_group_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotion_customer_groups_promotion_id_customer_group_id_key ON public.promotion_customer_groups USING btree (promotion_id, customer_group_id);


--
-- TOC entry 5225 (class 1259 OID 21880)
-- Name: promotion_customer_groups_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_idx ON public.promotion_customer_groups USING btree (promotion_id);


--
-- TOC entry 5226 (class 1259 OID 21881)
-- Name: promotion_customer_groups_promotion_id_is_excluded_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_is_excluded_idx ON public.promotion_customer_groups USING btree (promotion_id, is_excluded);


--
-- TOC entry 5227 (class 1259 OID 21882)
-- Name: promotion_logs_cart_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_cart_id_idx ON public.promotion_logs USING btree (cart_id);


--
-- TOC entry 5228 (class 1259 OID 21883)
-- Name: promotion_logs_checkout_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_checkout_id_idx ON public.promotion_logs USING btree (checkout_id);


--
-- TOC entry 5229 (class 1259 OID 21884)
-- Name: promotion_logs_coupon_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_coupon_code_idx ON public.promotion_logs USING btree (coupon_code);


--
-- TOC entry 5230 (class 1259 OID 21885)
-- Name: promotion_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_created_at_idx ON public.promotion_logs USING btree (created_at DESC);


--
-- TOC entry 5231 (class 1259 OID 21886)
-- Name: promotion_logs_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_customer_id_idx ON public.promotion_logs USING btree (customer_id);


--
-- TOC entry 5232 (class 1259 OID 21887)
-- Name: promotion_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_order_id_idx ON public.promotion_logs USING btree (order_id);


--
-- TOC entry 5235 (class 1259 OID 21888)
-- Name: promotion_logs_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_promotion_id_idx ON public.promotion_logs USING btree (promotion_id);


--
-- TOC entry 5236 (class 1259 OID 21889)
-- Name: promotion_products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_category_id_idx ON public.promotion_products USING btree (category_id);


--
-- TOC entry 5239 (class 1259 OID 21890)
-- Name: promotion_products_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_product_id_idx ON public.promotion_products USING btree (product_id);


--
-- TOC entry 5240 (class 1259 OID 21891)
-- Name: promotion_products_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_promotion_id_idx ON public.promotion_products USING btree (promotion_id);


--
-- TOC entry 5241 (class 1259 OID 21892)
-- Name: promotion_products_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_variant_id_idx ON public.promotion_products USING btree (variant_id);


--
-- TOC entry 5242 (class 1259 OID 21893)
-- Name: promotions_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_code_idx ON public.promotions USING btree (code);


--
-- TOC entry 5243 (class 1259 OID 21894)
-- Name: promotions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotions_code_key ON public.promotions USING btree (code);


--
-- TOC entry 5246 (class 1259 OID 21895)
-- Name: promotions_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_start_date_end_date_idx ON public.promotions USING btree (start_date, end_date);


--
-- TOC entry 5247 (class 1259 OID 21896)
-- Name: promotions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_idx ON public.promotions USING btree (status);


--
-- TOC entry 5248 (class 1259 OID 21897)
-- Name: promotions_status_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_start_date_end_date_idx ON public.promotions USING btree (status, start_date, end_date);


--
-- TOC entry 5249 (class 1259 OID 21898)
-- Name: shipping_method_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_customer_group_id_idx ON public.shipping_method_customer_groups USING btree (customer_group_id);


--
-- TOC entry 5252 (class 1259 OID 21899)
-- Name: shipping_method_customer_groups_shipping_method_id_customer_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX shipping_method_customer_groups_shipping_method_id_customer_key ON public.shipping_method_customer_groups USING btree (shipping_method_id, customer_group_id);


--
-- TOC entry 5253 (class 1259 OID 21900)
-- Name: shipping_method_customer_groups_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_shipping_method_id_idx ON public.shipping_method_customer_groups USING btree (shipping_method_id);


--
-- TOC entry 5254 (class 1259 OID 21901)
-- Name: shipping_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_code_idx ON public.shipping_methods USING btree (code);


--
-- TOC entry 5255 (class 1259 OID 21902)
-- Name: shipping_methods_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_is_active_priority_idx ON public.shipping_methods USING btree (is_active, priority);


--
-- TOC entry 5258 (class 1259 OID 21903)
-- Name: shipping_methods_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_type_idx ON public.shipping_methods USING btree (type);


--
-- TOC entry 5259 (class 1259 OID 21904)
-- Name: shipping_methods_zone_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_zone_id_idx ON public.shipping_methods USING btree (zone_id);


--
-- TOC entry 5260 (class 1259 OID 21905)
-- Name: shipping_zones_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_is_active_priority_idx ON public.shipping_zones USING btree (is_active, priority);


--
-- TOC entry 5263 (class 1259 OID 21906)
-- Name: shipping_zones_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_priority_idx ON public.shipping_zones USING btree (priority);


--
-- TOC entry 5264 (class 1259 OID 21907)
-- Name: storefront_filter_options_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_options_filter_id_is_active_sort_order_idx ON public.storefront_filter_options USING btree (filter_id, is_active, sort_order);


--
-- TOC entry 5265 (class 1259 OID 21908)
-- Name: storefront_filter_options_filter_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_options_filter_id_value_key ON public.storefront_filter_options USING btree (filter_id, value);


--
-- TOC entry 5268 (class 1259 OID 21909)
-- Name: storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, is_active, sort_order);


--
-- TOC entry 5269 (class 1259 OID 21910)
-- Name: storefront_filter_tree_nodes_filter_id_nav_link_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_tree_nodes_filter_id_nav_link_id_key ON public.storefront_filter_tree_nodes USING btree (filter_id, nav_link_id);


--
-- TOC entry 5270 (class 1259 OID 21911)
-- Name: storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, parent_id, sort_order);


--
-- TOC entry 5273 (class 1259 OID 21912)
-- Name: storefront_filters_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filters_code_key ON public.storefront_filters USING btree (code);


--
-- TOC entry 5274 (class 1259 OID 21913)
-- Name: storefront_filters_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filters_is_active_sort_order_idx ON public.storefront_filters USING btree (is_active, sort_order);


--
-- TOC entry 5277 (class 1259 OID 21914)
-- Name: storefront_nav_links_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_is_active_sort_order_idx ON public.storefront_nav_links USING btree (is_active, sort_order);


--
-- TOC entry 5280 (class 1259 OID 21915)
-- Name: storefront_nav_links_zone_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_zone_parent_id_sort_order_idx ON public.storefront_nav_links USING btree (zone, parent_id, sort_order);


--
-- TOC entry 5281 (class 1259 OID 21916)
-- Name: subscribers_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscribers_created_at_idx ON public.subscribers USING btree (created_at DESC);


--
-- TOC entry 5282 (class 1259 OID 21917)
-- Name: subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers USING btree (email);


--
-- TOC entry 5285 (class 1259 OID 21918)
-- Name: tax_classes_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tax_classes_code_idx ON public.tax_classes USING btree (code);


--
-- TOC entry 5286 (class 1259 OID 21919)
-- Name: tax_classes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tax_classes_code_key ON public.tax_classes USING btree (code);


--
-- TOC entry 5289 (class 1259 OID 21920)
-- Name: taxes_country_region_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_idx ON public.taxes USING btree (country, region);


--
-- TOC entry 5290 (class 1259 OID 21921)
-- Name: taxes_country_region_tax_class_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_tax_class_id_is_active_idx ON public.taxes USING btree (country, region, tax_class_id, is_active);


--
-- TOC entry 5291 (class 1259 OID 21922)
-- Name: taxes_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_is_active_idx ON public.taxes USING btree (is_active);


--
-- TOC entry 5294 (class 1259 OID 21923)
-- Name: taxes_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_start_date_end_date_idx ON public.taxes USING btree (start_date, end_date);


--
-- TOC entry 5295 (class 1259 OID 21924)
-- Name: taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_tax_class_id_idx ON public.taxes USING btree (tax_class_id);


--
-- TOC entry 5296 (class 1259 OID 21925)
-- Name: variant_option_values_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_option_id_idx ON public.variant_option_values USING btree (option_id);


--
-- TOC entry 5299 (class 1259 OID 21926)
-- Name: variant_option_values_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_value_id_idx ON public.variant_option_values USING btree (value_id);


--
-- TOC entry 5300 (class 1259 OID 21927)
-- Name: variant_option_values_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_variant_id_idx ON public.variant_option_values USING btree (variant_id);


--
-- TOC entry 5301 (class 2606 OID 21928)
-- Name: admin_role_permissions admin_role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5302 (class 2606 OID 21933)
-- Name: admin_role_permissions admin_role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5303 (class 2606 OID 21938)
-- Name: admin_user_roles admin_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5304 (class 2606 OID 21943)
-- Name: admin_user_roles admin_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5305 (class 2606 OID 21948)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5306 (class 2606 OID 21953)
-- Name: cms_banner_slides cms_banner_slides_slider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_slider_id_fkey FOREIGN KEY (slider_id) REFERENCES public.cms_banner_sliders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5307 (class 2606 OID 21958)
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5308 (class 2606 OID 21963)
-- Name: customers customers_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5309 (class 2606 OID 21968)
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5310 (class 2606 OID 21973)
-- Name: inventory_items inventory_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5311 (class 2606 OID 21978)
-- Name: inventory_reservations inventory_reservations_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5312 (class 2606 OID 21983)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5313 (class 2606 OID 21988)
-- Name: order_shipping order_shipping_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5314 (class 2606 OID 21993)
-- Name: order_shipping order_shipping_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5315 (class 2606 OID 21998)
-- Name: order_taxes order_taxes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5316 (class 2606 OID 22003)
-- Name: order_taxes order_taxes_tax_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES public.taxes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5317 (class 2606 OID 22008)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5318 (class 2606 OID 22013)
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5319 (class 2606 OID 22018)
-- Name: product_categories product_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5320 (class 2606 OID 22023)
-- Name: product_categories product_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5321 (class 2606 OID 22028)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5322 (class 2606 OID 22033)
-- Name: product_images product_images_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5324 (class 2606 OID 22038)
-- Name: product_option_values_on_products product_option_values_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5325 (class 2606 OID 22043)
-- Name: product_option_values_on_products product_option_values_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5326 (class 2606 OID 22048)
-- Name: product_option_values_on_products product_option_values_on_products_product_id_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_option_id_fkey FOREIGN KEY (product_id, option_id) REFERENCES public.product_options_on_products(product_id, option_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5327 (class 2606 OID 22053)
-- Name: product_option_values_on_products product_option_values_on_products_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5323 (class 2606 OID 22058)
-- Name: product_option_values product_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5328 (class 2606 OID 22063)
-- Name: product_options_on_products product_options_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5329 (class 2606 OID 22068)
-- Name: product_options_on_products product_options_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5330 (class 2606 OID 22073)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5331 (class 2606 OID 22078)
-- Name: promotion_customer_groups promotion_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5332 (class 2606 OID 22083)
-- Name: promotion_customer_groups promotion_customer_groups_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5333 (class 2606 OID 22088)
-- Name: promotion_logs promotion_logs_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5334 (class 2606 OID 22093)
-- Name: promotion_products promotion_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5335 (class 2606 OID 22098)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5336 (class 2606 OID 22103)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5337 (class 2606 OID 22108)
-- Name: shipping_methods shipping_methods_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5338 (class 2606 OID 22113)
-- Name: storefront_filter_options storefront_filter_options_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5339 (class 2606 OID 22118)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5340 (class 2606 OID 22123)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_nav_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_nav_link_id_fkey FOREIGN KEY (nav_link_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5341 (class 2606 OID 22128)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_filter_tree_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5342 (class 2606 OID 22133)
-- Name: storefront_nav_links storefront_nav_links_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5343 (class 2606 OID 22138)
-- Name: storefront_nav_links storefront_nav_links_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5344 (class 2606 OID 22143)
-- Name: taxes taxes_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_tax_class_id_fkey FOREIGN KEY (tax_class_id) REFERENCES public.tax_classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5345 (class 2606 OID 22148)
-- Name: variant_option_values variant_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5346 (class 2606 OID 22153)
-- Name: variant_option_values variant_option_values_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5347 (class 2606 OID 22158)
-- Name: variant_option_values variant_option_values_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-06-22 15:33:30

--
-- PostgreSQL database dump complete
--

\unrestrict iuTTj5HRwsLoyMJRnfo1U49G00qRITbh42yaf2blhEPuIY0hubdpAqjTUPrfV4D

