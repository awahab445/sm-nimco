--
-- PostgreSQL database dump
--

\restrict Kh8uxZEo98ovsTd6iN06Me5AoFH6un3nL38rkqEydsKkf5UxoFwx83aSe2WTClr

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-08-21 15:29:07

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
-- TOC entry 5703 (class 0 OID 0)
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
-- TOC entry 266 (class 1259 OID 22283)
-- Name: analytics_ga4_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_ga4_settings (
    id text DEFAULT 'default'::text NOT NULL,
    measurement_id character varying(32),
    is_enabled boolean DEFAULT false NOT NULL,
    debug_mode boolean DEFAULT false NOT NULL,
    track_page_views boolean DEFAULT true NOT NULL,
    track_cart_events boolean DEFAULT true NOT NULL,
    track_checkout_steps boolean DEFAULT true NOT NULL,
    track_purchases boolean DEFAULT true NOT NULL,
    track_refunds boolean DEFAULT false NOT NULL,
    track_custom_events boolean DEFAULT true NOT NULL,
    anonymize_ip boolean DEFAULT true NOT NULL,
    currency character varying(3) DEFAULT 'PKR'::character varying NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by_admin_user_id text,
    gtm_id character varying(32),
    meta_pixel_id character varying(32),
    meta_pixel_enabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.analytics_ga4_settings OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 22364)
-- Name: bundle_deal_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bundle_deal_items (
    id text NOT NULL,
    bundle_deal_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    quantity integer DEFAULT 1 NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    unit_list_price numeric(10,2)
);


ALTER TABLE public.bundle_deal_items OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 22342)
-- Name: bundle_deals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bundle_deals (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    deal_price numeric(10,2) NOT NULL,
    compare_at_total numeric(10,2) NOT NULL,
    savings_amount numeric(10,2) NOT NULL,
    savings_percent numeric(5,2),
    image_url text,
    valid_from timestamp(3) without time zone,
    valid_to timestamp(3) without time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.bundle_deals OWNER TO postgres;

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
    updated_at timestamp(3) without time zone NOT NULL,
    image_url text,
    banner_url text,
    is_featured boolean DEFAULT false NOT NULL
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
    updated_at timestamp(3) without time zone NOT NULL,
    text_align character varying(16) DEFAULT 'left'::character varying NOT NULL,
    text_position character varying(16) DEFAULT 'middle'::character varying NOT NULL,
    text_color character varying(16) DEFAULT 'light'::character varying NOT NULL,
    mobile_image_url text,
    image_url_tablet text
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
-- TOC entry 275 (class 1259 OID 22572)
-- Name: courier_cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courier_cities (
    id text NOT NULL,
    city_code character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    province character varying(100) NOT NULL,
    zone_id text NOT NULL,
    via character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.courier_cities OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 22554)
-- Name: courier_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courier_zones (
    id text NOT NULL,
    code character varying(1) NOT NULL,
    name character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    rate_less_than_10kg numeric(12,2) NOT NULL,
    rate_greater_or_equal_10kg numeric(12,2) NOT NULL
);


ALTER TABLE public.courier_zones OWNER TO postgres;

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
-- TOC entry 265 (class 1259 OID 22175)
-- Name: mail_mailboxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mail_mailboxes (
    id text NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    purpose character varying(50) NOT NULL,
    smtp_host character varying(255) NOT NULL,
    smtp_port integer DEFAULT 587 NOT NULL,
    smtp_secure boolean DEFAULT false NOT NULL,
    smtp_user character varying(255) NOT NULL,
    smtp_pass_enc text NOT NULL,
    from_name character varying(255) NOT NULL,
    from_address character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.mail_mailboxes OWNER TO postgres;

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
    rate numeric(8,4) NOT NULL,
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
    currency character varying(3) DEFAULT 'PKR'::character varying NOT NULL,
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
    updated_at timestamp(3) without time zone NOT NULL,
    shipping_weight double precision DEFAULT 1.0 NOT NULL,
    shipping_weight_unit text DEFAULT 'KG'::text NOT NULL
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
    deleted_at timestamp(3) without time zone,
    shipping_weight double precision DEFAULT 1.0 NOT NULL,
    shipping_weight_unit text DEFAULT 'KG'::text NOT NULL
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
-- TOC entry 273 (class 1259 OID 22534)
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_rates (
    id text NOT NULL,
    province character varying(100) NOT NULL,
    city character varying(100),
    min_weight_kg numeric(10,3) NOT NULL,
    max_weight_kg numeric(10,3) NOT NULL,
    rate_amount numeric(12,2) NOT NULL,
    is_cod_available boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_rates OWNER TO postgres;

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
-- TOC entry 267 (class 1259 OID 22313)
-- Name: site_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_config (
    id text DEFAULT 'default'::text NOT NULL,
    logo_url character varying(1024),
    logo_width integer DEFAULT 36 NOT NULL,
    logo_height integer DEFAULT 36 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by_admin_user_id text,
    announcement_text character varying(500),
    show_announcement boolean DEFAULT false NOT NULL
);


ALTER TABLE public.site_config OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 22508)
-- Name: social_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_links (
    id uuid NOT NULL,
    platform character varying(32) NOT NULL,
    url character varying(1024) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.social_links OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 22329)
-- Name: store_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_settings (
    id text DEFAULT 'default'::text NOT NULL,
    current_theme character varying(32) DEFAULT 'tailwind'::character varying NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by_admin_user_id text,
    minimum_order_amount numeric(12,2) DEFAULT 800 NOT NULL,
    free_delivery_threshold numeric(12,2) DEFAULT 2000 NOT NULL,
    shipping_gst_percentage numeric(5,2) DEFAULT 18 NOT NULL
);


ALTER TABLE public.store_settings OWNER TO postgres;

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
    rate numeric(8,4) NOT NULL,
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
-- TOC entry 271 (class 1259 OID 22477)
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    product_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- TOC entry 5641 (class 0 OID 21016)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4be09163-546a-4953-b6df-8df71596e289	3ce0ab10207beb367395ea2d99d96c53a55459676fd0842ca83bd2679dfef9e3	2026-07-01 16:38:32.578583+05	20260513100000_seed_storefront_categories		\N	2026-07-01 16:38:32.578583+05	0
b373a75e-9b56-4dc9-8d5a-15c881a89e10	1b671fdb6367320e48aa9f95a10d4604def5c5cf5eca17b615ebff0f5bac83be	2026-07-03 15:44:50.113664+05	20260703160000_add_store_settings		\N	2026-07-03 15:44:50.113664+05	0
5607237d-7295-43ce-b8f8-9b7508d14237	36ae9c804d961568000d45be4d4db3f615f02ceef867e8a655c0624bcdb27123	2026-07-03 16:07:55.684149+05	20260703170000_normalize_store_theme_ids		\N	2026-07-03 16:07:55.684149+05	0
2f5e8ab8-8df8-42ca-ac94-dfd319a32b57	561b2137465cd34c6501660d21ced3ea26bd3f77bf009360ed6db53318bead96	\N	20250308000000_add_customer_password_hash	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250308000000_add_customer_password_hash\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "customers" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"customers\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(639), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250308000000_add_customer_password_hash"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250308000000_add_customer_password_hash"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260	2026-07-03 20:31:00.199388+05	2026-05-04 11:22:21.031256+05	0
300d0e3e-535c-4c26-a76f-77c4382ad758	11a0ced84fb4fcf231e3ce51d31b7e7d24a122fd3981136527fc66e8d188a1f8	2026-07-03 20:31:13.831519+05	20260212120000_newsletter_subscribers		\N	2026-07-03 20:31:13.831519+05	0
0766ef5f-4934-4e17-b376-9bac50b214b8	126d53eeb064a23b081610440a8733f8272ea9e9146713410668e598c025e089	2026-07-03 20:31:22.615156+05	20260512120000_catalog_facet_options		\N	2026-07-03 20:31:22.615156+05	0
586cd204-5690-40cf-9dcb-dd8c176aeaca	e9228993f6b59fa0af9fa69d463a2962893a0e35bf0f51beeaef60910e5dec7b	2026-07-03 20:31:27.592094+05	20260512140000_storefront_filters		\N	2026-07-03 20:31:27.592094+05	0
4fd4514d-a2ba-45fb-9c1f-a721168aa015	be7e427d1f40054257520a4d15d871303f3da3a716b449235079028f03882e80	2026-07-03 20:31:34.524846+05	20260512180000_storefront_nav_links		\N	2026-07-03 20:31:34.524846+05	0
f134191e-68b3-4e3b-acaa-b6327795efd1	df71696b0ce26e84e7195111a4e4e6558f9083d39b852c21be52eacda1b299af	2026-07-03 20:31:47.982758+05	20260513110000_drop_storefront_nav_links		\N	2026-07-03 20:31:47.982758+05	0
83557c77-09f0-4055-88a1-014f92f07c19	bc7090dd3b2a1fa8002f09e50fdf8d0f831a92894b1ac9d9a068740d62cfb0f8	2026-07-03 20:31:53.986952+05	20260513140000_storefront_nav_hierarchy		\N	2026-07-03 20:31:53.986952+05	0
b548c23a-7ddd-48ec-a1fe-e3776e11dc00	db2f5f9fa051563a9bff4abb1fbf666f3a40ed19609d5082678b40a6291b9e8e	2026-07-03 20:31:59.055812+05	20260513160000_storefront_filter_browse_tree		\N	2026-07-03 20:31:59.055812+05	0
107e4368-d4ae-418c-bda5-ad5a470bbd59	3ca0f61703e0efd344120203209d68177275efb76276224c658776c2d904039a	2026-07-03 20:32:04.597113+05	20260514120000_storefront_nav_banner		\N	2026-07-03 20:32:04.597113+05	0
bd28ae97-1730-4789-adc4-35b20ee6e222	682fee84cf245bbfdc14a7db41bdf509f1a6ec14baa505da89beb6eddbe77b25	2026-07-03 20:32:09.572655+05	20260514140000_storefront_nav_mega_banner		\N	2026-07-03 20:32:09.572655+05	0
8452f5b6-b19e-477f-8044-65909c6dd464	03a024981533c2e45c76667d4a6b19690360da0c0934fca1974efa0478823c28	2026-07-03 20:32:14.564525+05	20260514160000_remove_complaints_nav_link		\N	2026-07-03 20:32:14.564525+05	0
f0f1e733-2cc8-4ff9-892f-a47262991551	27081bac22087a94eb1704aedc0992ee008a095ef6df40f4747eadee4054d92a	2026-07-03 20:32:19.984746+05	20260619120000_customer_email_verification		\N	2026-07-03 20:32:19.984746+05	0
13a32a50-357c-4f04-a11a-fb95ce82b70c	a8c3f4382db93d6f6a454e5f30eb1e86f4c2eb26e8fae5fd6e7794b98379be7a	2026-07-03 20:32:26.863106+05	20260622120000_customer_password_reset		\N	2026-07-03 20:32:26.863106+05	0
e9187746-acda-4a5b-91d4-b3224158c83e	9252db8547f2ce4edcf922fa0b13a81672596eac9b11fdd4e74f6d502a6c23ac	2026-07-03 20:32:32.918035+05	20260701120000_add_mail_mailboxes		\N	2026-07-03 20:32:32.918035+05	0
7ba8d271-c0a5-41a9-bc16-b08ae98764c8	dd42169a373a3736bdfb08a54f652fa92db6e469e71525ecee9d824b2e3cd7ee	2026-07-03 20:32:40.816049+05	20260702120000_add_analytics_ga4_settings		\N	2026-07-03 20:32:40.816049+05	0
8d227cbe-9489-4a13-bee8-97ea7becd097	6a7f18a93ef6ec2d9a629fe1c9a7989dd39ce135336143b624cc0593abf3e8c1	2026-07-03 20:32:51.914049+05	20260702132000_add_site_config		\N	2026-07-03 20:32:51.914049+05	0
4ad6f4c6-f492-4fb6-a344-73f6964706ed	8464180484695fece1fa3f67c88419bd798ce57be0bb485db795370b2b4f2bfd	2026-07-03 20:33:01.768078+05	20260702150000_add_site_config_announcement		\N	2026-07-03 20:33:01.768078+05	0
e20267a4-de7b-4b4b-8b9b-bce5847fc7ff	e714743d5cf5eae771bbc0f85fe8cff368abc2903d45ea9a5ac42321f50ca5c1	2026-07-03 20:33:12.15178+05	20260703130000_seed_product_descriptions		\N	2026-07-03 20:33:12.15178+05	0
c4cd7256-3f9e-470c-938e-fbf43879508a	44146beefff78616c38be328c9e52b4b25c4a23154cebad4555b5e44ae60fd8c	2026-07-03 20:33:36.315214+05	20260703180000_add_bundle_deals		\N	2026-07-03 20:33:36.315214+05	0
4062f493-599d-4da6-91c9-f7bec654c220	5110141f411630ade7ee5602b5c2c821e344640f8193237d45030c6ef8ac3820	2026-07-03 20:33:43.040625+05	20260703190000_add_gtm_id_to_analytics_settings		\N	2026-07-03 20:33:43.040625+05	0
b11ad6d0-fd29-46a0-b7a3-214ecb832a77	7485b63554ea4782242f2ebf6ad75a602b04ef7e2f9e04d66d95f16e119e4fd7	2026-07-03 20:33:50.595781+05	20260703200000_remove_home_nav_link		\N	2026-07-03 20:33:50.595781+05	0
4ee8f878-7cce-4d19-8ed4-c227d609cb09	968aa701f2aa3a2a9f2d9208a4d7f80d785d97ab01ae63b333581b534f4c541f	2026-07-20 16:15:30.553969+05	20260720120000_cms_slide_responsive_images	\N	\N	2026-07-20 16:15:30.521654+05	1
ccf19275-9e7e-4ef1-84e3-27294497d459	39d07672ddeef8953232a296ca20452b3809c43ed19850e42cdc8a80ad4b57d9	2026-07-09 11:17:16.991111+05	20260709120000_add_meta_pixel_to_analytics_settings	\N	\N	2026-07-09 11:17:16.951717+05	1
d6391157-6088-4f92-81ef-4dc1d5c3405d	cf67e827b59d62e60e1364add7ea6d30f05f9e17369b6b0bf5cdf55d2584bea7	2026-07-20 13:47:13.697895+05	20260719021500_add_cms_slide_text_overlay	\N	\N	2026-07-20 13:47:13.690755+05	1
fcb7403c-aab8-419d-89f3-3501154f487f	5fb8b03a8659250897022b90b29092db04f7750bb6e03c963148f8a5a027dbed	2026-07-20 13:47:13.689831+05	20260718230000_add_wishlist_items	\N	\N	2026-07-20 13:47:13.575323+05	1
1bbbe113-fc94-4f4f-80f0-3030afd7e9ab	e0bf97bf385a1db086e6c21dac7366a375f75568ac73735d49019b4b3e5311a1	2026-07-21 15:18:06.846257+05	20260721120000_add_social_links	\N	\N	2026-07-21 15:18:06.775852+05	1
ee6b91d7-4096-494a-9f5f-8821a1f8e3bb	76c56a7563cbe19e169aeba387a39b20c00a1f4d1ee54edb692ab2e2e589d9b5	2026-07-24 11:32:32.68807+05	20260723120000_store_order_thresholds	\N	\N	2026-07-24 11:32:32.630068+05	1
5b1d9830-64aa-4cad-bbf5-8412153f772f	ccbfbffcaaf5b39acd37d43fa3d0c93b4b0d3f56086889fea448480f290758b0	2026-07-24 13:17:05.316038+05	20260724120000_order_currency_default_pkr	\N	\N	2026-07-24 13:17:05.277563+05	1
0cf3b043-ad59-417c-ab6f-46895497de60	354547765af4815dc96859691f19bcbc0bd62f7fa894dc2682c0eb7b22699a70	2026-07-29 11:19:13.991515+05	20260729120000_add_shipping_rates	\N	\N	2026-07-29 11:19:13.763116+05	1
2287fea1-a7c0-4fda-93e9-b65e659fe00d	568a63ecc782c9dfcf6c95eb1c49f1e33e2bafc2e43037c83040d9ec4c8ae47c	2026-07-29 14:08:41.743634+05	20260729140000_add_courier_zones_cities	\N	\N	2026-07-29 14:08:41.658539+05	1
9c41b030-cc63-4f0e-a108-779e1e74a612	a3594fb584e1e3227659fa2968dc4e31b9773819b2d677d9ce02d682c92cfc2b	2026-07-29 15:41:11.168892+05	20260729160000_courier_zone_weight_tiers	\N	\N	2026-07-29 15:41:11.006219+05	1
eba2d346-7010-4203-b8a9-a776295381af	6762af6e5ad1952057a5d156479ec63e2ceb4762d430cd1e892429e17c341396	2026-08-01 11:15:00.904685+05	20260801120000_add_shipping_weight_fields	\N	\N	2026-08-01 11:15:00.885225+05	1
67dfdef5-b574-4998-a5d0-11ce972f0f05	987caef9800561d7e5152d07e4012e1fa9822cee7e4d13974f6687d5181fd322	2026-08-01 12:28:14.830668+05	20260801140000_widen_tax_rate_precision	\N	\N	2026-08-01 12:28:14.785602+05	1
ba2494cd-2583-4616-8ba5-b52d217f64cf	7a8fa94819208b1aeb4c994f7a7497f770c64b48d74c74cb0fc37abff4bddb74	2026-08-01 13:18:22.00752+05	20260801140000_courier_dual_rates_and_gst	\N	\N	2026-08-01 13:18:21.749395+05	1
99b0c430-c5ca-452a-a18e-9b81824b6997	4c5a7a642d8047e22dce1bddfb2bad22f439a750fa2249123a9e0e3e6f507652	2026-08-19 11:26:07.178417+05	20260819120000_category_banner_featured	\N	\N	2026-08-19 11:26:07.082897+05	1
\.


--
-- TOC entry 5642 (class 0 OID 21028)
-- Dependencies: 220
-- Data for Name: account_creation_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_creation_tokens (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5643 (class 0 OID 21039)
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
0adebdc6-0b0d-4dda-b217-5de5f3b5ed26	products.manage	Manage products, categories, and product options (implies all products.* actions)	2026-05-11 11:57:44.1
4ade7771-a344-4bcb-a7ee-4f079430104e	inventory.read	Read inventory	2026-05-04 07:22:01.056
7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583	inventory.manage	Manage inventory and stock	2026-05-04 07:22:01.057
1dcba78f-a3d7-496f-a2ba-ed6585be6b73	orders.manage	Manage orders (implies all orders.* actions)	2026-05-04 07:22:01.06
51062b59-ddd6-4ff8-ac4e-2f70f4cde409	customers.manage	Manage customers and groups (implies all customers.* actions)	2026-05-04 07:22:01.063
8332b6b7-13cb-472f-a4b0-73cc50eea78e	promotions.manage	Manage promotions	2026-05-04 07:22:01.064
9c38f5ea-ba4d-4d4f-b2a3-fd0afff68f77	deals.manage	Manage bundle deals	2026-07-03 12:10:10.676
55afa5c3-5076-4a94-a014-fa92c5fddb01	shipping.manage	Manage shipping zones and methods	2026-05-04 07:22:01.065
1c9d2a05-1853-4ace-bc60-e4156437384b	tax.manage	Manage tax classes and rates	2026-05-04 07:22:01.069
6a942717-6026-44e7-80e7-26858f8c3eb5	payments.manage	Manage payment configuration	2026-05-11 11:57:44.154
a629f498-ffea-40d3-b191-bb736eb424cf	cms.manage	Manage CMS pages, blocks, and sliders	2026-05-06 11:10:43.51
664eb436-11ef-46e0-975d-9b30e7f6a127	subscriptions.manage	View storefront email subscriptions (subscriber list)	2026-05-12 07:40:14.805
ccaa881a-2690-41ec-aec9-c061f97c9b7d	reports.read	Access reports and exports	2026-05-04 07:22:01.072
29f643ad-529b-4b68-9932-1828b89c8fa1	settings.manage	Platform settings and mail server configuration	2026-05-04 07:22:01.074
036f5c51-140d-4e96-b731-e44c1fad7f94	mail.manage	Manage SMTP mailboxes and test connections	2026-07-01 09:05:53.504
b22f323b-da34-43ae-b526-d4cf00a148dd	analytics.manage	Manage GA4 analytics and ecommerce tracking	2026-07-01 14:23:18.282
669ddf50-cf30-4822-8de0-96a7b2192a72	products.delete	Delete products	2026-05-11 11:57:44.127
578c6923-b261-4247-ab41-a11f61e98b6a	orders.create	Create orders (admin-side)	2026-05-11 11:57:44.129
2c5b5e04-816b-4864-bf47-d7eff12f79d4	orders.read	Read orders	2026-05-04 07:22:01.059
85e0875b-36cf-41ae-ac81-bab9cf0a5b14	orders.update	Update orders, status, fulfillment	2026-05-11 11:57:44.133
7b44e006-b5f3-4800-94f8-c068828c2f2b	orders.delete	Delete orders	2026-05-11 11:57:44.134
269ae629-3064-4e6d-8bd8-2fb2d7d8814d	customers.create	Create customers	2026-05-11 11:57:44.136
ea11fbc5-c6c8-43c6-b013-66cebc87beba	customers.read	Read customers	2026-05-04 07:22:01.062
b6151fdf-2507-4841-a50e-24668be1ea79	customers.update	Update customers	2026-05-11 11:57:44.139
1d702124-962e-4d24-9a83-cbfb33b21b93	customers.delete	Delete customers	2026-05-11 11:57:44.141
\.


--
-- TOC entry 5644 (class 0 OID 21048)
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
926550ee-84bb-414a-99f6-e11673f3da0e	0adebdc6-0b0d-4dda-b217-5de5f3b5ed26
926550ee-84bb-414a-99f6-e11673f3da0e	4ade7771-a344-4bcb-a7ee-4f079430104e
926550ee-84bb-414a-99f6-e11673f3da0e	7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583
926550ee-84bb-414a-99f6-e11673f3da0e	1dcba78f-a3d7-496f-a2ba-ed6585be6b73
926550ee-84bb-414a-99f6-e11673f3da0e	51062b59-ddd6-4ff8-ac4e-2f70f4cde409
926550ee-84bb-414a-99f6-e11673f3da0e	8332b6b7-13cb-472f-a4b0-73cc50eea78e
926550ee-84bb-414a-99f6-e11673f3da0e	9c38f5ea-ba4d-4d4f-b2a3-fd0afff68f77
926550ee-84bb-414a-99f6-e11673f3da0e	55afa5c3-5076-4a94-a014-fa92c5fddb01
926550ee-84bb-414a-99f6-e11673f3da0e	1c9d2a05-1853-4ace-bc60-e4156437384b
926550ee-84bb-414a-99f6-e11673f3da0e	6a942717-6026-44e7-80e7-26858f8c3eb5
926550ee-84bb-414a-99f6-e11673f3da0e	a629f498-ffea-40d3-b191-bb736eb424cf
926550ee-84bb-414a-99f6-e11673f3da0e	664eb436-11ef-46e0-975d-9b30e7f6a127
926550ee-84bb-414a-99f6-e11673f3da0e	ccaa881a-2690-41ec-aec9-c061f97c9b7d
926550ee-84bb-414a-99f6-e11673f3da0e	29f643ad-529b-4b68-9932-1828b89c8fa1
926550ee-84bb-414a-99f6-e11673f3da0e	036f5c51-140d-4e96-b731-e44c1fad7f94
926550ee-84bb-414a-99f6-e11673f3da0e	b22f323b-da34-43ae-b526-d4cf00a148dd
926550ee-84bb-414a-99f6-e11673f3da0e	669ddf50-cf30-4822-8de0-96a7b2192a72
926550ee-84bb-414a-99f6-e11673f3da0e	578c6923-b261-4247-ab41-a11f61e98b6a
926550ee-84bb-414a-99f6-e11673f3da0e	2c5b5e04-816b-4864-bf47-d7eff12f79d4
926550ee-84bb-414a-99f6-e11673f3da0e	85e0875b-36cf-41ae-ac81-bab9cf0a5b14
926550ee-84bb-414a-99f6-e11673f3da0e	7b44e006-b5f3-4800-94f8-c068828c2f2b
926550ee-84bb-414a-99f6-e11673f3da0e	269ae629-3064-4e6d-8bd8-2fb2d7d8814d
926550ee-84bb-414a-99f6-e11673f3da0e	ea11fbc5-c6c8-43c6-b013-66cebc87beba
926550ee-84bb-414a-99f6-e11673f3da0e	b6151fdf-2507-4841-a50e-24668be1ea79
926550ee-84bb-414a-99f6-e11673f3da0e	1d702124-962e-4d24-9a83-cbfb33b21b93
e4d44e14-47e2-4632-8c43-1ee84cd85eca	5bc3fe92-08d5-4857-b05b-c1b912418a6b
e4d44e14-47e2-4632-8c43-1ee84cd85eca	bd93314d-9f7e-4048-b578-e518247f01b0
e4d44e14-47e2-4632-8c43-1ee84cd85eca	d8693266-66d8-4df3-964f-3b3c854155b9
e4d44e14-47e2-4632-8c43-1ee84cd85eca	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
e4d44e14-47e2-4632-8c43-1ee84cd85eca	cf811019-a242-4070-851b-3fbb11e88898
e4d44e14-47e2-4632-8c43-1ee84cd85eca	0adebdc6-0b0d-4dda-b217-5de5f3b5ed26
e4d44e14-47e2-4632-8c43-1ee84cd85eca	4ade7771-a344-4bcb-a7ee-4f079430104e
e4d44e14-47e2-4632-8c43-1ee84cd85eca	7a71bbd5-3e2e-4d9f-a0ac-43563e7fb583
e4d44e14-47e2-4632-8c43-1ee84cd85eca	1dcba78f-a3d7-496f-a2ba-ed6585be6b73
e4d44e14-47e2-4632-8c43-1ee84cd85eca	51062b59-ddd6-4ff8-ac4e-2f70f4cde409
e4d44e14-47e2-4632-8c43-1ee84cd85eca	8332b6b7-13cb-472f-a4b0-73cc50eea78e
e4d44e14-47e2-4632-8c43-1ee84cd85eca	9c38f5ea-ba4d-4d4f-b2a3-fd0afff68f77
e4d44e14-47e2-4632-8c43-1ee84cd85eca	55afa5c3-5076-4a94-a014-fa92c5fddb01
e4d44e14-47e2-4632-8c43-1ee84cd85eca	1c9d2a05-1853-4ace-bc60-e4156437384b
e4d44e14-47e2-4632-8c43-1ee84cd85eca	6a942717-6026-44e7-80e7-26858f8c3eb5
e4d44e14-47e2-4632-8c43-1ee84cd85eca	a629f498-ffea-40d3-b191-bb736eb424cf
e4d44e14-47e2-4632-8c43-1ee84cd85eca	664eb436-11ef-46e0-975d-9b30e7f6a127
e4d44e14-47e2-4632-8c43-1ee84cd85eca	ccaa881a-2690-41ec-aec9-c061f97c9b7d
e4d44e14-47e2-4632-8c43-1ee84cd85eca	29f643ad-529b-4b68-9932-1828b89c8fa1
e4d44e14-47e2-4632-8c43-1ee84cd85eca	036f5c51-140d-4e96-b731-e44c1fad7f94
e4d44e14-47e2-4632-8c43-1ee84cd85eca	b22f323b-da34-43ae-b526-d4cf00a148dd
e4d44e14-47e2-4632-8c43-1ee84cd85eca	669ddf50-cf30-4822-8de0-96a7b2192a72
e4d44e14-47e2-4632-8c43-1ee84cd85eca	578c6923-b261-4247-ab41-a11f61e98b6a
e4d44e14-47e2-4632-8c43-1ee84cd85eca	2c5b5e04-816b-4864-bf47-d7eff12f79d4
e4d44e14-47e2-4632-8c43-1ee84cd85eca	85e0875b-36cf-41ae-ac81-bab9cf0a5b14
e4d44e14-47e2-4632-8c43-1ee84cd85eca	7b44e006-b5f3-4800-94f8-c068828c2f2b
e4d44e14-47e2-4632-8c43-1ee84cd85eca	269ae629-3064-4e6d-8bd8-2fb2d7d8814d
e4d44e14-47e2-4632-8c43-1ee84cd85eca	ea11fbc5-c6c8-43c6-b013-66cebc87beba
e4d44e14-47e2-4632-8c43-1ee84cd85eca	b6151fdf-2507-4841-a50e-24668be1ea79
e4d44e14-47e2-4632-8c43-1ee84cd85eca	1d702124-962e-4d24-9a83-cbfb33b21b93
f72b62cb-1ae0-4ba2-b178-12539e326c14	bd93314d-9f7e-4048-b578-e518247f01b0
f72b62cb-1ae0-4ba2-b178-12539e326c14	e0e19340-ce43-46a4-b5b7-fb8622c2fdcd
f72b62cb-1ae0-4ba2-b178-12539e326c14	4ade7771-a344-4bcb-a7ee-4f079430104e
f72b62cb-1ae0-4ba2-b178-12539e326c14	ccaa881a-2690-41ec-aec9-c061f97c9b7d
f72b62cb-1ae0-4ba2-b178-12539e326c14	2c5b5e04-816b-4864-bf47-d7eff12f79d4
f72b62cb-1ae0-4ba2-b178-12539e326c14	ea11fbc5-c6c8-43c6-b013-66cebc87beba
\.


--
-- TOC entry 5645 (class 0 OID 21053)
-- Dependencies: 223
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_roles (id, slug, name, description, is_system, created_at, updated_at) FROM stdin;
5dc16cb3-f12c-4195-9c85-90563c17d927	inventory-management	inventory management	update & manage inventory	f	2026-05-11 09:40:56.034	2026-05-11 09:40:56.034
36d65b9f-5927-487b-be37-943b03c16541	products-management	products management	update and manage all products	f	2026-05-11 12:02:41.329	2026-05-11 12:02:41.329
926550ee-84bb-414a-99f6-e11673f3da0e	super-admin	Super Admin	Full platform access. Assign sparingly.	t	2026-05-04 07:22:01.076	2026-08-21 10:24:46.465
e4d44e14-47e2-4632-8c43-1ee84cd85eca	manager	Operations Manager	Day-to-day commerce operations without user/role administration.	t	2026-05-12 07:03:29.765	2026-08-21 10:24:46.471
f72b62cb-1ae0-4ba2-b178-12539e326c14	support	Support	Read-heavy access for customer service.	t	2026-05-12 07:03:29.768	2026-08-21 10:24:46.473
\.


--
-- TOC entry 5646 (class 0 OID 21066)
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
-- TOC entry 5647 (class 0 OID 21071)
-- Dependencies: 225
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, password_hash, first_name, last_name, is_active, last_login_at, created_at, updated_at) FROM stdin;
1988f799-1a91-49d9-8322-36d857c54915	products@admin.com	$2b$10$VNC/Tyfa5JH/FI7DcGmwou5P0HlaXmZ3KA0T9dnAf8rQqhpeOdl3y	products	management	t	2026-05-11 17:03:42.621+05	2026-05-11 12:03:18.182	2026-05-11 12:03:42.624
f2579ef9-ed54-4bcc-a685-61f049bf38a0	dummy@admin.com	$2b$10$I6FYLJt9Vs/JS0nK4iSX6eSV2UY5jpweG1kkFuWqxRoAy..ij18My	inventory	manager	t	2026-05-12 10:53:22.532+05	2026-05-11 09:41:54.067	2026-05-12 05:53:22.533
20dd43d6-e741-4256-bf8d-8fef76fb7c47	a.wahab445@gmail.com	$2b$10$aYlaY6PZ6o.AKWYdUr775uZW9A0bfkp0mka65ej/BomKZsZmLkwei	abdul	wahab	t	2026-06-13 21:10:39.305+05	2026-05-11 09:21:52.545	2026-06-13 16:10:39.306
f4b18155-4045-41e5-8bfc-c9371013bbd3	huzaifa@admin.com	$2b$10$b9eBNs4skCrh/Fy/70wta.64I6Z1w60vXENXBSnCf2qNEACEuoG2u	Super	Admin	t	2026-08-20 16:46:01.449+05	2026-05-04 07:22:01.201	2026-08-20 11:46:01.576
\.


--
-- TOC entry 5688 (class 0 OID 22283)
-- Dependencies: 266
-- Data for Name: analytics_ga4_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_ga4_settings (id, measurement_id, is_enabled, debug_mode, track_page_views, track_cart_events, track_checkout_steps, track_purchases, track_refunds, track_custom_events, anonymize_ip, currency, updated_at, updated_by_admin_user_id, gtm_id, meta_pixel_id, meta_pixel_enabled) FROM stdin;
default	\N	f	f	f	f	f	f	f	f	f	PKR	2026-07-24 06:49:54.298	f4b18155-4045-41e5-8bfc-c9371013bbd3	\N	\N	f
\.


--
-- TOC entry 5692 (class 0 OID 22364)
-- Dependencies: 270
-- Data for Name: bundle_deal_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundle_deal_items (id, bundle_deal_id, product_id, variant_id, quantity, "position", unit_list_price) FROM stdin;
c8797ecd-78b6-4b96-ab5b-0cc3caa35e94	99cd1458-03f1-4170-8d81-4fe0d4435add	05268a8c-518a-4ff4-8691-3cfdff054382	e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	1	2	50.00
b76a91cf-5365-40ce-808e-1d2ebd7beda3	cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	eb72e342-64df-4566-8029-db2c63859130	fdf241e4-b0d0-456e-8da6-eef5c1124666	2	1	120.00
0fdd8b8c-cb5e-4327-a988-84f234e15772	cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	5eaf65df-0faa-4975-be7b-6a2554a04f13	b85f7fa3-cb5b-4754-8399-6f792a3bf635	1	2	80.00
9ea7c7e2-5aa6-4ab8-8a00-6b985d9dab11	cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	09cfaa0d-9088-4e2d-823e-3ad80af8853b	480fc5fd-9198-4c2f-ae38-8a0b052a9313	1	3	159.00
f75db338-2a7a-4436-bb96-2a5789a1cc56	cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	72c84214-a05b-40e8-9093-d76177afd8d9	80c8d8b5-ebed-42d3-aca4-9611d4585f71	1	4	200.00
bdf232f3-1445-4af3-a14d-620e4bd3f99d	99cd1458-03f1-4170-8d81-4fe0d4435add	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	1	0	200.00
226a4691-16a2-4fa3-917a-24cc5a1e9f34	cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	2	0	200.00
8a347a21-867d-4d5d-b8bc-603db1a17fa9	99cd1458-03f1-4170-8d81-4fe0d4435add	64289463-e48b-4261-bfef-e59b622eb20e	\N	1	1	50.00
326b5127-04cf-4c6b-9e11-693c7b002cf9	cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	64289463-e48b-4261-bfef-e59b622eb20e	\N	2	5	50.00
7d2119a3-ad43-4e23-8be4-9e21ab4df320	86599038-0d58-4469-81ea-7f5ea9f24d4d	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	\N	2	1	200.00
4b87a3e5-70d2-43e0-8a7b-b15cc4033dee	86599038-0d58-4469-81ea-7f5ea9f24d4d	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	3	3	100.00
7d629f34-29dc-40c2-9cce-0574ae47175d	86599038-0d58-4469-81ea-7f5ea9f24d4d	64289463-e48b-4261-bfef-e59b622eb20e	\N	3	2	50.00
adbf736b-ef57-45b8-8a15-9e3ecd7bb92d	cfed3405-716c-4f9e-a0fb-3906f4f4ad1c	11920e18-2c21-473c-a201-54cfa6870a03	\N	2	0	150.00
55ea5c6a-0afa-426d-a4aa-881e75a523c7	cfed3405-716c-4f9e-a0fb-3906f4f4ad1c	0019bc5a-cfda-423a-8033-04e19527878c	\N	4	1	100.00
0ef98167-7474-4a5e-b67d-7f979799e5a8	cfed3405-716c-4f9e-a0fb-3906f4f4ad1c	2e6248be-15bb-45a8-8dc1-245118193c6f	\N	5	2	50.00
d08795b6-10fa-4c48-a1e6-5dbe6fe15d59	86599038-0d58-4469-81ea-7f5ea9f24d4d	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	3	0	50.00
a09441ed-944b-43af-bc6c-b75c7d9595e8	6391ecb3-0fc2-43e1-85db-150e5eafd56e	3edc41b7-3996-4d29-8ece-a8282dd70fda	b375a668-b488-4aa7-9ea1-d8fe0fd2db2d	1	0	220.00
590453b5-9d13-4c8b-90ab-391d0bc7a74f	6391ecb3-0fc2-43e1-85db-150e5eafd56e	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	3fd2dd57-5c35-455b-9c00-b8a766c99af8	1	1	220.00
ec07a68b-a346-48f7-8047-26bb15ce31cf	6391ecb3-0fc2-43e1-85db-150e5eafd56e	d9c95ec4-df7a-4778-86bb-c3818e8cac28	3304f70d-4296-4e6e-8af3-2296b477bb76	1	2	220.00
172b32c2-c790-484a-aacf-3ede4fcb84aa	6391ecb3-0fc2-43e1-85db-150e5eafd56e	ad76bca0-acfc-45a6-91c7-1ef7099e9275	02479d88-36af-4f24-bcc5-3961eabd5b44	1	3	110.00
01e822b3-5240-4dcd-8281-89f6507ebf26	6391ecb3-0fc2-43e1-85db-150e5eafd56e	48d973ce-0795-4e24-9adb-d897c7d8d8a9	8a8ab41b-1143-41d7-8dbf-3d6317a6eaac	2	4	100.00
9906db62-9616-4285-924a-09bde203a866	79c15629-9a29-4844-b735-3a4723455390	185d2b70-8297-41cf-afc5-ee14fd38464a	665e39cf-cb52-465c-afa4-f628fc6d3615	1	0	220.00
d402de00-977c-45d8-80a4-d6f7a0d259af	79c15629-9a29-4844-b735-3a4723455390	2c7e550f-32a1-465e-b974-f57f152838fb	1b58621b-3d2a-4e9d-ae99-d7d51f2d7d2e	1	1	220.00
ff9f22a7-c7f5-46b8-bf2f-d05d4d359568	79c15629-9a29-4844-b735-3a4723455390	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	3a50b8f0-ecb7-4ef4-a8c5-c648c55b5b6e	1	2	110.00
d6066ada-357f-441a-bfbf-afaf35582ff9	79c15629-9a29-4844-b735-3a4723455390	3edc41b7-3996-4d29-8ece-a8282dd70fda	b375a668-b488-4aa7-9ea1-d8fe0fd2db2d	1	3	220.00
0f9781ec-8d98-4e64-8a3a-41109a7aec3f	79c15629-9a29-4844-b735-3a4723455390	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	70f3a35c-1a0f-4cfa-9c33-8810c2a04913	1	4	220.00
ad6833b5-f690-4636-8239-3d10c4ae4c4b	79c15629-9a29-4844-b735-3a4723455390	93b883de-d033-4336-99bf-d802b93e700f	698a8acc-c5bd-43a5-89dd-e122bf57834e	1	5	220.00
7c50db63-386e-426d-8a5f-eb2cf86cc8a9	79c15629-9a29-4844-b735-3a4723455390	d9c95ec4-df7a-4778-86bb-c3818e8cac28	3304f70d-4296-4e6e-8af3-2296b477bb76	1	6	220.00
bef2d393-4973-4c34-9945-46896fde23f4	79c15629-9a29-4844-b735-3a4723455390	ad76bca0-acfc-45a6-91c7-1ef7099e9275	02479d88-36af-4f24-bcc5-3961eabd5b44	1	7	110.00
295b8888-18d0-4c00-a989-bd659529c1d7	4132d364-b464-498f-bef9-26823e067917	8424893c-142f-4bbd-ad5f-72423b437023	03314898-7431-4813-963b-c114c9a5a7b1	1	0	440.00
363647cf-431b-4d4a-85cb-88254dc753de	4132d364-b464-498f-bef9-26823e067917	cafb9e6a-4403-4838-8235-1f2b976df6a8	e00ecc16-14e6-448e-b745-bf555ffe3d3f	1	1	220.00
32609f63-77a7-4eb1-a82d-a336aa075c0b	4132d364-b464-498f-bef9-26823e067917	2ca10703-c8c7-4688-94e8-ac1c930ad511	d7c62cda-b7cf-43c3-806b-e62f07d4db78	1	2	500.00
72a587f4-d948-4b36-98da-8227d5d5f67b	4132d364-b464-498f-bef9-26823e067917	c7d28472-8483-416b-908b-39bbd023e33e	28825a16-ce19-45ca-be5a-c61e7d62b418	1	3	100.00
a54bc9d8-8f0f-4fad-af7a-9c6e5ade2577	4132d364-b464-498f-bef9-26823e067917	93b883de-d033-4336-99bf-d802b93e700f	6b83fd33-f2a0-44f6-aefa-6040ddebfe38	1	4	110.00
a41e72d7-99de-4448-afc0-6dc3900d5c1f	4132d364-b464-498f-bef9-26823e067917	9888d0bb-b6d8-47b7-8132-28dd4147cb43	97e0bb0b-e90b-417d-9cc7-b1b2230b18cf	1	5	110.00
\.


--
-- TOC entry 5691 (class 0 OID 22342)
-- Dependencies: 269
-- Data for Name: bundle_deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundle_deals (id, title, slug, description, status, is_featured, deal_price, compare_at_total, savings_amount, savings_percent, image_url, valid_from, valid_to, metadata, created_at, updated_at, deleted_at) FROM stdin;
6391ecb3-0fc2-43e1-85db-150e5eafd56e	Chai Shai Combo	chai-shai-combo	\N	active	t	949.00	970.00	21.00	2.16	/uploads/deals/f1827726-bc90-4a1a-824b-c528f93a7a65.jpeg	2026-08-20 06:55:00	2026-09-30 06:56:00	{}	2026-08-20 11:59:05.967	2026-08-20 12:10:23.144	\N
79c15629-9a29-4844-b735-3a4723455390	The Mega Nimco Box	the-mega-nimco-box	\N	active	t	1499.00	1540.00	41.00	2.66	/uploads/deals/c15864ce-82ee-47e6-afd8-42f16a7e816b.jpeg	2026-08-20 07:02:00	2026-09-30 07:02:00	{}	2026-08-20 12:04:30.948	2026-08-20 12:10:46.991	\N
4132d364-b464-498f-bef9-26823e067917	GupShup Bucket	gupshup-bucket	\N	active	t	1419.00	1480.00	61.00	4.12	/uploads/deals/b89741f8-4c55-4801-9a85-7da06644c06e.jpeg	2026-08-20 06:59:00	2026-09-30 06:59:00	{}	2026-08-20 12:02:05.415	2026-08-20 12:11:03.142	\N
cbdd8647-1dcc-4f77-bfdc-55fbde4f368c	DEAL1	deal1	deals no1	active	t	1000.00	1179.00	179.00	15.18	/uploads/deals/532f3b01-63f4-4a2a-aa6a-5f915f4ed950.png	2026-07-02 11:32:00	2026-07-30 11:32:00	{}	2026-07-03 12:33:08.886	2026-07-23 10:36:14.818	2026-07-23 10:36:14.816
99cd1458-03f1-4170-8d81-4fe0d4435add	home bundle	home-bundle	\N	active	t	250.00	300.00	50.00	16.67	\N	2026-07-01 07:52:00	2026-07-31 07:52:00	{}	2026-07-07 12:53:15.094	2026-07-23 10:36:16.551	2026-07-23 10:36:16.549
cfed3405-716c-4f9e-a0fb-3906f4f4ad1c	Chips Deals	chips-deals	\N	active	t	870.00	950.00	80.00	8.42	/uploads/deals/82a9448c-bc9e-4790-8e84-4e6b037dcb8a.png	2026-07-23 05:48:00	2026-07-31 05:48:00	{}	2026-07-23 10:50:32.915	2026-08-20 11:55:36.387	2026-08-20 11:55:36.386
86599038-0d58-4469-81ea-7f5ea9f24d4d	Azadi Namkeen Deal	azadi-deal	\N	active	t	910.00	1000.00	90.00	9.00	\N	2026-07-23 05:46:00	2026-08-14 05:46:00	{}	2026-07-23 10:47:59.953	2026-08-20 11:55:39.187	2026-08-20 11:55:39.185
\.


--
-- TOC entry 5648 (class 0 OID 21084)
-- Dependencies: 226
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, parent_id, "position", is_active, created_at, updated_at, image_url, banner_url, is_featured) FROM stdin;
dbda699b-86f8-4b9b-9de0-b8729f96f00d	NIMCOS	nimcos		\N	0	t	2026-08-19 06:42:43.432	2026-08-19 07:04:12.951	\N	/uploads/categories/49c8e5a5-ab56-4279-9d6b-53d01070f451.jpeg	t
dfe9c40b-4923-4580-ab31-a7936e2c6981	BAKERY ITEMS	bakery-items		\N	3	t	2026-08-19 06:45:12.41	2026-08-19 07:05:15.734	\N	/uploads/categories/a3f85b93-a78e-48bd-a443-723852e5d6f9.jpeg	t
12992097-98ae-4b19-a0ec-7552f6ab05bc	SWEETS	sweets		\N	2	t	2026-08-19 06:43:18.365	2026-08-19 07:05:22.797	\N	/uploads/categories/e65ce671-d8c6-491d-87d7-5e8021a52909.jpeg	t
c14b7d5e-37da-4b83-83c3-e7e55deb74ce	PEANUTS & PAPRI	peanuts-papri		\N	4	t	2026-08-19 06:52:18.444	2026-08-19 07:06:17.347	\N	/uploads/categories/184de02f-dd99-4f08-b6c3-6230f219b92a.jpeg	t
396fb3c1-3ef9-45f9-8944-9fe29ec83747	CHIPS	chips		\N	1	t	2026-08-19 06:42:54.704	2026-08-19 07:08:50.09	\N	/uploads/categories/565b0a54-9419-4785-8632-34286664b84f.jpeg	t
\.


--
-- TOC entry 5649 (class 0 OID 21099)
-- Dependencies: 227
-- Data for Name: cms_banner_sliders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_sliders (id, name, identifier, is_active, autoplay_ms, created_at, updated_at, slide_height_px, slide_width_px) FROM stdin;
\.


--
-- TOC entry 5650 (class 0 OID 21112)
-- Dependencies: 228
-- Data for Name: cms_banner_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_slides (id, slider_id, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active, created_at, updated_at, text_align, text_position, text_color, mobile_image_url, image_url_tablet) FROM stdin;
\.


--
-- TOC entry 5651 (class 0 OID 21128)
-- Dependencies: 229
-- Data for Name: cms_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_blocks (id, name, identifier, description, content_html, content_json, is_active, created_at, updated_at) FROM stdin;
f0a06619-77d8-4341-be1c-5264e7b2114d	Home page lay out1	home-page-layout1	test run	Home page layout JSON block.	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "test run ", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "blocks test run."}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}]}	t	2026-05-09 11:00:52.585	2026-05-09 11:13:53.205
b1666ef1-3569-4837-bcc7-60da6b3e5aca	Home inline teaser	home-inline-teaser	Example block embedded in homepage layout by identifier	<div class="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"><h2 class="text-lg font-semibold text-foreground">Managed as its own block</h2><p class="mt-2 text-sm text-muted-foreground">This copy lives in the <strong>home-inline-teaser</strong> CMS block. The home layout references it by identifier so you can edit it separately from the layout JSON.</p></div>	{}	t	2026-05-09 15:06:31.808	2026-07-07 13:03:21.146
5fd1a7da-ae28-4ea8-abeb-b3cbfca36dc3	Home Page Layout	home-page-layout	Structured sections consumed by storefront homepage	<p>Home page layout JSON block.</p>	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mosaic-a", "type": "promo_banner", "title": "For life", "ctaHref": "/products", "eyebrow": "Nutrition", "ctaLabel": "Shop now", "textAlign": "left", "buttonStyle": "primary", "backgroundColor": "#d4efe3", "productImageUrl": "/themes/mehfil-shereen/banner1.jpeg"}, {"id": "promo-mosaic-b", "type": "promo_banner", "title": "Make love this look", "eyebrow": "Lookbook 2021", "imageUrl": "/themes/mehfil-shereen/texture.png", "textAlign": "center"}, {"id": "promo-mosaic-c", "type": "promo_banner", "title": "For children", "ctaHref": "/products", "eyebrow": "Vitamin", "ctaLabel": "Shop now", "subtitle": "Up to 50% off", "textAlign": "left", "buttonStyle": "secondary", "backgroundColor": "#f5e9b8", "productImageUrl": "/themes/mehfil-shereen/banner1.jpeg"}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "Members save more", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "Create your account for exclusive offers."}, {"id": "inline-teaser", "type": "cms_block_ref", "blockIdentifier": "home-inline-teaser"}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}, {"id": "subscription", "type": "subscription_cta", "title": "Stay in the loop", "subtitle": "Get product drops and offers by email."}]}	t	2026-05-06 11:10:43.581	2026-07-23 12:45:03.699
\.


--
-- TOC entry 5652 (class 0 OID 21142)
-- Dependencies: 230
-- Data for Name: cms_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_pages (id, title, slug, status, excerpt, meta_title, meta_description, content_html, content_json, published_at, created_at, updated_at) FROM stdin;
91a59ded-c6f8-48ad-8ad7-4710ce375b97	About Us	about-us	published	Learn more about our mission and team.	About Us	About our ecommerce store and what we stand for.	<h1>About Us</h1><p>We are building a modern ecommerce experience with trusted products and reliable delivery.</p><p>Our mission is simple: quality, transparency, and customer-first service.</p>	{}	2026-07-07 13:03:21.063	2026-05-06 11:10:43.576	2026-07-07 13:03:21.107
7239ee2a-01f7-4916-8c7b-b8c9a7ab7ac1	Privacy Policy	privacy-policy	published	How we collect, use, and protect your personal information.	Privacy Policy	Read how we handle your data, cookies, and account information.	<h2>Information we collect</h2><p>We collect information you provide when creating an account, placing an order, or contacting support — such as your name, email, phone number, and delivery address.</p><h2>How we use it</h2><p>We use your information to process orders, provide customer support, improve our storefront, and send transactional messages related to your purchases.</p><h2>Data security</h2><p>We apply reasonable technical and organizational measures to protect your data. Payment details are handled by secure payment providers and are not stored on our servers.</p><h2>Your choices</h2><p>You may update account details from your profile or contact us to request access or correction of your personal data where applicable.</p>	{}	2026-07-07 13:03:21.113	2026-07-07 13:03:21.131	2026-07-07 13:03:21.131
e3559750-5067-46f7-a531-b91bf6f9fc16	Terms & Conditions	terms-conditions	published	Terms governing use of our website and purchases.	Terms & Conditions	Store terms of use, ordering rules, and limitations of liability.	<h2>Using our store</h2><p>By browsing or purchasing from this website, you agree to these terms. You must provide accurate information when creating an account or placing an order.</p><h2>Orders &amp; pricing</h2><p>All prices are shown in the store currency unless stated otherwise. We reserve the right to correct pricing errors and to cancel orders affected by such errors before fulfillment.</p><h2>Product information</h2><p>We aim to display accurate descriptions and images. Minor variations in packaging or appearance may occur without notice.</p><h2>Liability</h2><p>To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of the site or delayed delivery beyond our reasonable control.</p>	{}	2026-07-07 13:03:21.119	2026-07-07 13:03:21.135	2026-07-07 13:03:21.135
9880d9f8-73dc-4cc9-9c2e-8f0fbaa76787	Shipping & Returns	shipping-returns	published	Delivery timelines, shipping rates, and return policy.	Shipping & Returns	Delivery timelines, shipping rates, and return policy.	<h2>Shipping</h2><p>We process orders within 1–2 business days. Standard delivery typically arrives within 3–7 business days depending on your location. Free shipping may apply on qualifying order values — see the announcement bar or checkout for current thresholds.</p><h2>Returns</h2><p>If you receive a damaged or incorrect item, contact us within 7 days of delivery with your order number and photos. Approved returns are refunded or replaced according to our customer care review.</p><h2>Questions</h2><p>For shipping or return help, visit <strong>Track order</strong> or reach out via our contact channels.</p>	{}	2026-07-07 13:03:21.107	2026-07-07 13:03:21.124	2026-07-07 13:05:12.928
\.


--
-- TOC entry 5697 (class 0 OID 22572)
-- Dependencies: 275
-- Data for Name: courier_cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courier_cities (id, city_code, name, province, zone_id, via, is_active, created_at, updated_at) FROM stdin;
b4f9adb9-9927-401e-9fe9-f2c12c3ee985	01174	ABBASPUR  (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:05.437	2026-08-01 08:22:17.663
9dd5c8c6-ccd9-4e73-8041-fc374941bf92	00001	ABBOTABAD	Khyber Pakhtunkhwa	09c212e9-7926-4cb7-aac4-6be051ef9e3d	ABBOTABAD	t	2026-07-29 09:18:05.44	2026-08-01 08:22:17.666
0059ba89-acb3-4268-aa69-b2ed7dc353b6	00924	ABDUL HAKIM	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MIAN CHANNU	t	2026-07-29 09:18:05.442	2026-08-01 08:22:17.67
21836057-f4c8-41a7-83e2-74040603ab12	00335	ABL 281 J.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:05.444	2026-08-01 08:22:17.672
18851980-585f-4733-9399-8b5a35c980a1	01245	ABL SALOONJHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:05.447	2026-08-01 08:22:17.675
6ff25f7d-3133-4319-a9ae-dc52514261d5	00119	ABOHA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.449	2026-08-01 08:22:17.677
64d587a7-08d8-494c-990f-7c4843ada582	02691	ADA SHAIWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:05.45	2026-08-01 08:22:17.679
89bda9b6-e903-490d-8ed8-e65e18cda599	01261	ADDA 46 CHAK  S	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.454	2026-08-01 08:22:17.685
d6272c28-ee5d-4431-8517-b77ad13add93	01451	ADDA AUJLA KALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:05.456	2026-08-01 08:22:17.687
0eca774c-be75-487f-9a99-993d6ff15479	01130	ADDA BADYANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PASRUR	t	2026-07-29 09:18:05.458	2026-08-01 08:22:17.689
1cf4162c-bd0b-4706-ab15-37bba0d11c3f	02695	ADDA GHULAM HUSSAIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:05.46	2026-08-01 08:22:17.692
b4f40d16-6305-42ba-b07b-35d7f2b7d2c1	00141	ADDA JAHAN KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:05.462	2026-08-01 08:22:17.693
ca0632c7-e2f5-448b-a021-17ef4c7b41a3	02672	ADDA JIN PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:05.51	2026-08-01 08:22:17.695
ef029f8f-b0eb-4cf6-b86e-4cef2c9f05e8	02694	ADDA MURID SHAKH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:05.512	2026-08-01 08:22:17.698
01ad7a7b-0dd0-45bb-963e-d48886f77cbe	01435	ADDA PAKHI MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:05.514	2026-08-01 08:22:17.701
d31f8c92-921a-4475-9d5b-24b52250e0a4	00336	ADDA PENSRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:05.516	2026-08-01 08:22:17.704
25f33868-cc9e-4367-bc84-1da1afd73574	01246	ADDA PHLOOR ONL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:05.518	2026-08-01 08:22:17.706
047cfb06-e4ae-43b5-91c0-49ebc0acd25a	01083	ADDA SIRAJ	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:05.52	2026-08-01 08:22:17.708
fcced24a-3fc2-4b61-a368-233a9e2b0af5	00337	ADDA THIKRIWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:05.522	2026-08-01 08:22:17.711
22e2bb04-649b-485d-882b-94247d74c20f	02648	ADDA ZAKHIRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:05.524	2026-08-01 08:22:17.713
83f1608c-2e8b-416b-9e86-438371941cdf	01006	ADIL PUR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR MATHELO	t	2026-07-29 09:18:05.526	2026-08-01 08:22:17.715
dd3a711e-b46c-4827-bde7-4e6c04ded00e	00755	AGHAR JAMALPUR	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:05.528	2026-08-01 08:22:17.719
46f9e9f0-649c-44e2-915e-903372edbba8	04019	AGRA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:05.53	2026-08-01 08:22:17.721
94a647a8-dd34-49ca-93c6-df07a7f9984a	00925	AGWANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:05.532	2026-08-01 08:22:17.724
46653e4d-9940-4bb5-894b-8467fb0f4160	01452	AHMAD NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:05.534	2026-08-01 08:22:17.726
7bac906d-e706-4766-b135-814ed48a83fe	00100	AHMAD PUR EAST	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BAHAWALPUR	t	2026-07-29 09:18:05.536	2026-08-01 08:22:17.738
be52ae4f-c3c1-45d4-988a-4b45c3884624	02690	AHMAD PUR LAMA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:05.538	2026-08-01 08:22:17.74
ea5abd53-1ac6-441b-bb2b-81a858e14d54	00542	AHMAD PUR SIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:05.54	2026-08-01 08:22:17.743
3105aedb-c7d8-439f-9934-949cadccddf7	00667	AHMADABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KARK	t	2026-07-29 09:18:05.542	2026-08-01 08:22:17.745
65dedf7d-8f81-40c1-874e-2e74b334d79b	01206	AHMDDAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:05.545	2026-08-01 08:22:17.747
cd73c395-bb6f-4d6a-a2c1-b3afa40cba52	01771	AJNALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.547	2026-08-01 08:22:17.751
52b72e51-c6f2-41d0-b8de-414193568e4e	00265	AKAL GARH (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:05.549	2026-08-01 08:22:17.754
1c99e48c-4588-4534-96c9-a09a2567c58c	01401	AKHAGARAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:05.551	2026-08-01 08:22:17.756
0593b945-a6a5-4d40-a966-db48db134296	00538	AKORA KHATTAQ	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	JEHANGIRA	t	2026-07-29 09:18:05.553	2026-08-01 08:22:17.759
690fa372-1beb-41bd-baa7-c9668e811f0b	01091	AKRI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:05.555	2026-08-01 08:22:17.761
c00c9f10-de34-4c36-aafa-85b12a159161	01385	AKWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:05.557	2026-08-01 08:22:17.764
24331a25-ef48-4d15-bf1b-ef05b58b67e5	00120	ALADAND DHERI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.559	2026-08-01 08:22:17.766
8ce7b771-693d-41e4-8ed7-caa1a49e9706	00813	ALI CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LALAMUSA	t	2026-07-29 09:18:05.561	2026-08-01 08:22:17.77
ea872cd0-78ec-49fd-b328-548bbd2f9e42	00448	ALI KHAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:05.563	2026-08-01 08:22:17.772
1936f84e-64d7-4f0c-8b79-7e9f7d850009	01262	ALI PUR SYEDAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.565	2026-08-01 08:22:17.774
1e22f78c-8033-4a0c-9242-a715457cb6b6	02683	ALI WAHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:05.567	2026-08-01 08:22:17.776
b76f6c5a-80d3-4478-b0ae-4c0bccfff1e3	00726	ALI ZAI KURRAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:05.569	2026-08-01 08:22:17.778
977f647e-a734-4fe8-9d23-2ef65861ca26	01021	ALIOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.571	2026-08-01 08:22:17.78
5b89b917-be20-4467-ab6e-aff509aea3e1	01068	ALIPUR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MUZAFFARGARH	t	2026-07-29 09:18:05.573	2026-08-01 08:22:17.783
19df4e5b-3e8e-40d3-a418-f37dfe2c57b6	00400	ALIPUR  CHATTHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:05.577	2026-08-01 08:22:17.786
0bd0a1b0-3c00-4603-970c-b38f9bf7eb2c	01084	ALIPUR SAYYADAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:05.58	2026-08-01 08:22:17.788
53d166fd-0f82-4fb9-94c5-bb79333e0018	01453	ALLAH ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:05.582	2026-08-01 08:22:17.79
5ddbf5b0-2084-4c64-8cfd-3f0d8246ca56	00505	AADHI KOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:05.435	2026-08-01 08:22:17.66
ec224512-9840-4460-99a9-a80424563a13	00154	AMBRIALA CHOWK	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:05.591	2026-08-01 08:22:17.803
6909cacc-a82d-4b1e-ad56-babaa54f1e81	00181	AMIN ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.593	2026-08-01 08:22:17.805
8cef0313-794e-4a62-98ce-06fb572b5b13	00182	AMIR PUR MANGAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.595	2026-08-01 08:22:17.807
5b892f6b-59c3-48b1-8d58-b4799f654650	00703	AMRA KALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:05.597	2026-08-01 08:22:17.809
1156cc74-35c6-4ffb-ab18-b39c208aaf17	00506	ANGA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:05.599	2026-08-01 08:22:17.811
7dcb5d80-b899-4fa8-a6d5-1bbb6a6a2aa9	00122	APA COLONY	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.603	2026-08-01 08:22:17.815
a98b2f73-259c-4363-a889-18c70835e3a8	01022	APS MURREE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.605	2026-08-01 08:22:17.819
a5577fac-0f0d-4bb6-a0cb-a642f6810a7d	00926	ARIFABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:05.607	2026-08-01 08:22:17.821
e2766bf8-c227-492b-aab9-66d5516c66a0	01237	ARIFWALA	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SAHIWAL	t	2026-07-29 09:18:05.609	2026-08-01 08:22:17.823
43e02c39-dc94-4444-820e-eea2970b6865	00818	ARIJA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:05.611	2026-08-01 08:22:17.825
6b9c2163-ab52-468a-aa0f-727f0095609b	01105	ASHOOR ABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:05.613	2026-08-01 08:22:17.827
de317362-fc17-4ab4-bcc3-26bf16e8a581	00330	ASTORE	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GILGIT	t	2026-07-29 09:18:05.615	2026-08-01 08:22:17.829
13ef6f7a-8a34-4a4b-a956-4370e140e5f8	00543	ATHARAN HAZARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:05.617	2026-08-01 08:22:17.832
aa4ecad8-3ce2-47f4-9b94-285d2d71dadd	00881	ATTAR SHISHA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.62	2026-08-01 08:22:17.836
d3c81ded-f26a-4468-a45c-7af25eb84003	00406	ATTAWA MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:05.622	2026-08-01 08:22:17.838
62e598a1-ccde-450b-9019-fab9597be70d	00035	ATTOCK	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	ATTOCK	t	2026-07-29 09:18:05.624	2026-08-01 08:22:17.84
c7b592c5-f871-4ed6-9e1c-3f4ca85038e4	00036	ATTOCK KHURD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:05.626	2026-08-01 08:22:17.842
c23d7bac-c607-4c17-b5d1-84b33a3765e7	00704	ATTOWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:05.628	2026-08-01 08:22:17.844
50b67983-b2fd-4654-b558-6c8830a085bc	00500	AWAGUT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JARANWALA	t	2026-07-29 09:18:05.63	2026-08-01 08:22:17.846
98bc3d43-b21d-4cc7-88d2-5f43e118237a	01175	AWAN ABAD(BATHI	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:05.632	2026-08-01 08:22:17.848
80457dd0-5d3c-4607-ae92-e697ce7e3ed2	01161	AWARAN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:05.634	2026-08-01 08:22:17.852
e454bb22-53bb-4d4f-92a1-cde700fa8984	01176	AZIZ ABAD (A.K.	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:05.636	2026-08-01 08:22:17.854
9d4fced0-8917-4d7f-88ef-0f2bb3da76d7	01454	AZIZ CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:05.638	2026-08-01 08:22:17.856
47a6abad-9955-4c54-8d9d-b06542bcdcb0	00002	AZIZABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:05.64	2026-08-01 08:22:17.858
aca8a217-c023-47b9-9ee5-075bae616cb9	01402	B.B. COLONY	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:05.643	2026-08-01 08:22:17.86
f385986a-10e6-4f03-a116-9ba773c8893c	00727	BABRI BANDA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:05.645	2026-08-01 08:22:17.863
3f9a650f-2a5d-4a98-82db-8cf1e6a1acbb	00989	BACHA BAND	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:05.647	2026-08-01 08:22:17.865
ea2ba30b-cacc-45b8-802c-4f57c16b24a3	00819	BADAH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:05.649	2026-08-01 08:22:17.869
bff0bf01-8da9-4834-8b5f-6dea289a5c75	00074	BADIN	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BADIN	t	2026-07-29 09:18:05.651	2026-08-01 08:22:17.871
02f3c0b0-9c48-4d02-a4fa-5ff8f8a0f313	01709	BADOMALHI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:05.653	2026-08-01 08:22:17.872
0c48ac07-888f-4261-820c-41f07f664ece	01106	BADRASHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:05.655	2026-08-01 08:22:17.875
d35d4e4b-f2a0-4d14-9be6-077c0f274e47	00859	BADSHAHPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:05.657	2026-08-01 08:22:17.877
77114127-f303-492a-8306-c3449da0d4e1	00882	BAFA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.659	2026-08-01 08:22:17.879
40d81ab9-1d8d-4cd6-bf7d-ff59b6f27c44	02612	BAGARGI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:05.661	2026-08-01 08:22:17.881
ede003dd-55d5-4a71-a6d0-fd506e2a5998	00728	BAGGAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:05.664	2026-08-01 08:22:17.885
27e13429-8b56-4a2d-bcc1-c76d3170c818	01045	BAGH (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:05.666	2026-08-01 08:22:17.887
7bb5d6f7-1bf1-4b8a-9d9f-41d91c42df9f	02618	BAGH (SINDH)	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:05.668	2026-08-01 08:22:17.889
a9c493cc-eadd-4b60-98c7-0bdc61bdc2e1	00003	BAGNOTER	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:05.67	2026-08-01 08:22:17.891
d42a9f0c-916c-4e97-9f00-ee6b4012c30f	00083	BAHAWALNAGAR	Gilgit-Baltistan	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BAHAWALNAGAR	t	2026-07-29 09:18:05.672	2026-08-01 08:22:17.893
1c90c6ba-888e-4ce5-a249-7eb780a94362	00099	BAHAWALPUR	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	BAHAWALPUR	t	2026-07-29 09:18:05.674	2026-08-01 08:22:17.896
9cd1621d-0928-4b05-8cfe-9567ef8c02bd	00965	BAHRAIN (SWAT)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:05.676	2026-08-01 08:22:17.898
6bf3f7e0-eb47-4d75-bc1a-93c781b51763	01207	BAHTAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:05.678	2026-08-01 08:22:17.902
3b1a8ab4-3285-47ed-8592-e56fd3c002c7	00427	BAHUWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:05.681	2026-08-01 08:22:17.904
ecd918be-244f-4a67-a58a-719986c51ce7	00345	BAKHAR ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.683	2026-08-01 08:22:17.906
c6ec8a11-5b26-4dcc-8f04-7bb78915f15f	00902	BAKHSHALI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:05.685	2026-08-01 08:22:17.908
ecc40828-7ca5-4b3f-a7d6-158e7088a130	01023	BAKOTE SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.687	2026-08-01 08:22:17.91
9afbe1c4-809a-4eaa-86a5-3dd91c69cb16	00820	BAKRANI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:05.689	2026-08-01 08:22:17.912
abffcee5-f7f2-4289-9f47-d7a7916ddc31	00552	BALA BHATYAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.691	2026-08-01 08:22:17.914
a798d7b3-4ced-4f69-9fc4-69e9a5b1e51f	00449	BALDHER	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:05.698	2026-08-01 08:22:17.921
8be42fca-95bd-41e7-82fe-43c39d194aec	00346	BALIAM PANDORI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.7	2026-08-01 08:22:17.923
8e9f986d-96c5-4465-85fa-7b72fc0a2cf3	00183	BALKASAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.702	2026-08-01 08:22:17.925
aab84286-2abc-4366-92eb-a9603a2e9efa	00729	BALLI TUNG	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:05.704	2026-08-01 08:22:17.927
12d93845-406d-4ef2-a57c-5f1df6a6d32b	00940	BALOKHEL CITY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:05.706	2026-08-01 08:22:17.929
17ac34f4-9198-4565-8a57-4fe42b436043	00450	BANDI GULLOO	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:05.708	2026-08-01 08:22:17.931
3914ebc5-867f-4fb4-84c1-68c8d7cced28	00428	BANGIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:05.71	2026-08-01 08:22:17.935
aa142f67-58c2-411b-a934-c80922bfa3c8	01229	BANGLA MANTHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:05.712	2026-08-01 08:22:17.937
7b007e07-04c8-4650-8106-94530540fcc9	00086	BANGLA YATEEM W	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:05.714	2026-08-01 08:22:17.939
d33a569e-af75-4d32-a222-b8d8bf04d592	00184	BANGWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.716	2026-08-01 08:22:17.941
31cc2393-27d3-4630-a6de-0675b6bbbf4e	00429	BANIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:05.718	2026-08-01 08:22:17.943
b144dc31-d1b3-428b-9218-86a3aedd23da	00110	BANNU	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BANNU	t	2026-07-29 09:18:05.72	2026-08-01 08:22:17.948
b8758e93-8a04-4b4a-a704-701a3b406207	00347	BANTH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.722	2026-08-01 08:22:17.953
0edeb377-169a-4e9a-ae44-8aa54b0b0c95	00860	BAR MUSA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:05.724	2026-08-01 08:22:17.955
c3e35b7b-d792-4b5e-8af3-7c447e28e4df	01107	BARA BANDA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:05.726	2026-08-01 08:22:17.957
e59f72fc-a421-485d-9bb6-c8b90ec7a016	01141	BARA MARKET	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	PESHAWAR	t	2026-07-29 09:18:05.729	2026-08-01 08:22:17.959
337e79e1-ef8c-4281-9534-3e7011aa0ded	00123	BARIKOT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.731	2026-08-01 08:22:17.961
60eee82e-7fec-4301-8505-dadb83e847ab	00489	BARILA SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:05.733	2026-08-01 08:22:17.963
49710837-e08c-48af-a43c-448f554b543c	01327	BARKHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:05.735	2026-08-01 08:22:17.965
96710401-0c46-463c-9623-5f4b7b5f66c1	00155	BARNALA  (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:05.737	2026-08-01 08:22:17.969
212838bd-e42a-4d4c-ae92-c178aab49e5a	00185	BASHARAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.739	2026-08-01 08:22:17.971
2b27969f-c324-454c-9b69-179d26d9bec8	00037	BASIA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:05.741	2026-08-01 08:22:17.974
2651dcf9-6572-4013-9b28-81487a1e1ee8	01125	BASSER PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	OKARA	t	2026-07-29 09:18:05.743	2026-08-01 08:22:17.976
9346398b-adbf-412b-8913-9d2d8e09270c	00295	BASTI MALHANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:05.747	2026-08-01 08:22:17.98
fda94b67-f47f-4af6-bce5-130232103f75	02646	BASTI MALOOK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:05.749	2026-08-01 08:22:17.982
bb4fa510-f5bd-4108-a47f-2a272745ea70	00884	BATGRAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.751	2026-08-01 08:22:17.986
4f232a6e-43ea-474f-8a39-457144582ff8	00266	BATHRUI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:05.753	2026-08-01 08:22:17.988
6e911ec9-9863-4f87-a829-8a1649f89c00	00118	BATKHELA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.755	2026-08-01 08:22:17.99
8692c4dd-cfb1-46d3-a46b-2ca057853f5e	00885	BATTAL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.757	2026-08-01 08:22:17.992
512f31e1-9cc4-454c-b0d1-b303261a9070	00170	BAZARGAI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:05.759	2026-08-01 08:22:17.995
3344db56-34dd-4d13-a720-abd1f19ebd88	00430	BAZURGWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:05.761	2026-08-01 08:22:17.996
1f026593-5038-4a3c-b0d1-d7d59aaaf8aa	00886	BEESHAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.764	2026-08-01 08:22:17.998
959ad1f3-11c6-4640-b890-9c73e1cf34ce	01677	BEGAM KOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:05.766	2026-08-01 08:22:18.002
4940e953-736f-4784-9998-b94e7b9798b9	00038	BEH BODI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:05.768	2026-08-01 08:22:18.005
a744b514-8203-49d0-8085-7b8e9faf47c4	00142	BEHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:05.77	2026-08-01 08:22:18.007
e4f9d7d3-5373-4d1d-be50-f68cac9503b4	00608	BELA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:05.772	2026-08-01 08:22:18.009
29e0fafc-0af6-4abb-8a36-ba03a4fd2391	01024	BEROTE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.774	2026-08-01 08:22:18.011
d9ede3d5-48fe-446e-82ee-795cee7a32ce	00348	BEWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.776	2026-08-01 08:22:18.013
e44244e0-7e29-4cbe-8724-12583750a193	01768	BHABRRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.778	2026-08-01 08:22:18.015
00896f33-bc55-44e6-abe1-26daf7a73e1b	00349	BHADDANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.78	2026-08-01 08:22:18.02
1ecac7b5-5d91-4256-9d2f-c254073171e7	04025	BHAG	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:05.782	2026-08-01 08:22:18.023
c72b1b6f-ad53-42f4-8381-cef4e97fb7c3	01263	BHAGATANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.784	2026-08-01 08:22:18.025
7b234aa4-612a-425d-95c9-3310e77e318f	00490	BHAGOWAL KALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:05.786	2026-08-01 08:22:18.027
61dc52ab-a55c-4599-8560-a2147bfbd1ab	00186	BHAGWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.788	2026-08-01 08:22:18.029
be8bc3f5-c30c-4649-b9d3-330203edd710	00134	BHAI PHERU	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	BHAI PHERU	t	2026-07-29 09:18:05.79	2026-08-01 08:22:18.031
32b12452-d8d7-4ab2-b447-0de9f3202abd	00887	BHAIR KUND	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.792	2026-08-01 08:22:18.033
35909f85-3bd9-47be-89dd-0700d094e258	00140	BHAKKAR	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BHAKKAR	t	2026-07-29 09:18:05.795	2026-08-01 08:22:18.038
9bdef4ea-478a-42f4-b3fa-32b956a6232a	01264	BHALWAL	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SARGODHA	t	2026-07-29 09:18:05.797	2026-08-01 08:22:18.04
71a61c37-803d-4b45-bbf8-4793a9b9b2ad	00883	BALAKOT	Khyber Pakhtunkhwa	58dae26b-44d2-43ac-9424-1a7926196e32	MANSEHRA	t	2026-07-29 09:18:05.696	2026-08-01 08:22:17.919
da670fa2-27b1-401c-b1c1-a207edc9c6d3	00351	BHANGALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.803	2026-08-01 08:22:18.047
c6a2d683-a086-4c28-9c11-480bbaf031d8	00352	BHAR RATIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.805	2026-08-01 08:22:18.049
f142eeed-175d-40cd-90c5-f134ed634ca0	00487	BHARA KHU	Islamabad Capital Territory	4740d071-cb15-43e2-a5cb-339f17016116	ISLAMABAD	t	2026-07-29 09:18:05.808	2026-08-01 08:22:18.053
2f78d40d-a5cf-467a-a1d5-8645f9503dd7	00353	BHATTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.81	2026-08-01 08:22:18.055
e91794b0-8989-45df-9cea-73a1ce56a6cc	01455	BHATTI KE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:05.812	2026-08-01 08:22:18.058
06f100b2-af2f-43c7-b0cc-734cb0167b8a	00431	BHATTIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:05.814	2026-08-01 08:22:18.06
95d2551a-dc72-4a10-91d2-e3416e7da216	00187	BHAUN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.816	2026-08-01 08:22:18.062
ade61b28-122c-478f-a63e-b3f327aafa76	01265	BHERA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	SARGODHA	t	2026-07-29 09:18:05.82	2026-08-01 08:22:18.068
a7285e13-8bb9-4a51-8151-c2de3e06f634	00188	BHIKARI KALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.822	2026-08-01 08:22:18.071
0477fc6d-f3eb-427b-ba82-ae2bd9434dec	00861	BHIKI SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:05.824	2026-08-01 08:22:18.073
4af252b3-1981-4abe-9a08-f6d73f009a6c	01281	BHIKKI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:05.826	2026-08-01 08:22:18.076
e1810321-d172-41dc-851d-d8f3a078e582	00862	BHIKO MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:05.829	2026-08-01 08:22:18.078
cbfe0cdb-e692-4730-b727-662bdafe32af	00153	BHIMBER	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:05.831	2026-08-01 08:22:18.08
134d3c28-d658-46f1-b437-eb2d69b71c50	01013	BHIRIA ROAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MORO	t	2026-07-29 09:18:05.833	2026-08-01 08:22:18.082
7c5415bb-6ea5-43dc-b647-c89517aa43d9	01014	BHIRIA TOWN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MORO	t	2026-07-29 09:18:05.835	2026-08-01 08:22:18.086
5570d906-ea14-4530-97b1-bf6e49557c3b	00477	BHIT SHAH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:05.837	2026-08-01 08:22:18.088
af8be8e6-c379-4643-a4f5-7de906e588e2	00331	BHONE	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GILGIT	t	2026-07-29 09:18:05.839	2026-08-01 08:22:18.091
a41d5cbc-4da8-456c-9e5e-ed8b9673fce0	01311	BHOPALWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:05.841	2026-08-01 08:22:18.093
f19d3361-703d-4053-95f7-b09f9c0cc10c	00255	BHOWANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHINIOT	t	2026-07-29 09:18:05.843	2026-08-01 08:22:18.096
17651efc-72c0-449b-ba98-a62aa66070a1	00553	BHOWANJ	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.845	2026-08-01 08:22:18.098
135af5be-7e75-4a3d-a665-f47986ff986b	00156	BHRING (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:05.848	2026-08-01 08:22:18.103
b362e32a-f046-4e6c-b085-3daea1a7d509	00189	BHUBBAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.85	2026-08-01 08:22:18.105
51a9c401-5a2e-4742-ac83-2be1b839693b	01386	BHUDIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:05.852	2026-08-01 08:22:18.108
115adc2d-ca9d-4874-a587-68f78776651e	01025	BHURBAN PEARL C	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.854	2026-08-01 08:22:18.11
a0208657-9da8-438e-81e2-05afae67d787	01069	BHUTTA PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:05.855	2026-08-01 08:22:18.112
5a55fee7-b873-4fc5-844b-b7464b8c751e	01387	BIDAR WINHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:05.857	2026-08-01 08:22:18.114
d3a2fb1c-fc99-4f15-a720-cb5c2057e908	00705	BIDDER MARJAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:05.859	2026-08-01 08:22:18.118
313009b8-5528-4a2b-b34f-6adaf8f93298	00507	BILOW FARM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:05.861	2026-08-01 08:22:18.121
5be5f406-e86d-4cdd-bfa9-02ce25d042e9	01208	BISAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:05.864	2026-08-01 08:22:18.123
f72759dc-9526-4015-a886-e616b5bbdb9d	01177	BLOOUCH  (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:05.866	2026-08-01 08:22:18.126
15761fd0-1cdf-4c04-96c5-8f6bc11c8b05	00432	BOKEN MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:05.868	2026-08-01 08:22:18.128
ed21a3e1-d536-476c-a249-ab5d4db0a2c4	00554	BOLANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.87	2026-08-01 08:22:18.131
2416ce26-3f37-418a-8c04-7004cc5a482a	01239	BONGA HAYAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:05.872	2026-08-01 08:22:18.135
b4416e0a-f2b3-43da-8bce-8c4aece54dfd	00039	BROTHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:05.874	2026-08-01 08:22:18.138
2d585449-7e78-42b4-afa4-ad5171bbc829	00757	BRUND BATHA(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:05.876	2026-08-01 08:22:18.14
1301a13e-84cb-438b-b6fa-d47dc5667620	00190	BUCHAL KALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.878	2026-08-01 08:22:18.142
75e95eab-414a-4392-b86d-8f40d607659f	01282	BUCHEKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:05.88	2026-08-01 08:22:18.145
d5fd9bbf-fa0b-475e-893d-2b402781dc25	01092	BUCHERI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:05.882	2026-08-01 08:22:18.147
1604b367-989b-4eaa-b8cb-e8d0c612cfa8	00610	BULEDA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:05.885	2026-08-01 08:22:18.152
9aa630a5-5fc4-475c-bc2e-071940d9d9eb	01178	BUNN BEHK (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:05.887	2026-08-01 08:22:18.154
dccf0cd2-89c4-401d-a9fa-a5513d2b27d0	00169	BUNNER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:05.889	2026-08-01 08:22:18.157
51bf6664-3ddb-4eb0-b742-1c5fdaf87916	00178	BUREWALA	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	BUREWALA	t	2026-07-29 09:18:05.891	2026-08-01 08:22:18.159
0242d525-9d37-41a4-b0e0-c914584e10fe	01283	BURG ATTARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:05.893	2026-08-01 08:22:18.161
b6d760ff-3539-4099-b481-8179a10c7e62	02623	BUXA PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHISTIAN	t	2026-07-29 09:18:05.895	2026-08-01 08:22:18.164
5a38832b-ec0e-42b6-9b8a-63eb3a8377fb	01026	CADET COLL. LOW	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.897	2026-08-01 08:22:18.169
d4acb923-fffe-4703-b04b-1dc474a565dd	01027	CADET COLL. SUN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.899	2026-08-01 08:22:18.171
5e4e4db1-091a-4040-9516-7f7c4402c142	00821	CADET COLLEGE L	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:05.901	2026-08-01 08:22:18.173
24e7111d-336a-4a66-aeaa-f8e092ce4fb9	01028	CALIF DUN CAMP	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:05.903	2026-08-01 08:22:18.176
6645e333-0d29-462f-b638-579719f55380	02605	CHAK	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:05.905	2026-08-01 08:22:18.178
de09a1db-9561-4b50-b7a4-5d19f626249b	01782	CHAK 16	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:05.911	2026-08-01 08:22:18.188
e3e7d527-2de8-42bf-a09b-ae1c9dd42ae2	00685	CHAK 168/10R	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:05.914	2026-08-01 08:22:18.191
d8ab8413-bb51-484d-8b65-dcda68d3f1ac	01721	CHAK 203	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	FAISALABAD	t	2026-07-29 09:18:05.916	2026-08-01 08:22:18.193
a06aa8b0-3b74-4931-b4d1-7c1255bacae5	01783	CHAK 26	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:05.918	2026-08-01 08:22:18.196
101770d1-46c4-47db-95fb-fa745d155d65	01737	CHAK 36	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.92	2026-08-01 08:22:18.204
c92adad2-5e17-4535-8ba7-6b0a2f3c8dd9	02678	CHAK 38/P	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAHIM YAR KHAN	t	2026-07-29 09:18:05.922	2026-08-01 08:22:18.206
1e85ba6f-90a3-4611-8cb9-2239c76009b8	01766	CHAK 45	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.924	2026-08-01 08:22:18.208
b2610509-84f3-4339-9f95-0fe82518ed68	01738	CHAK 46	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.926	2026-08-01 08:22:18.211
7885e88b-484d-4352-80d3-b69e29ec91d5	01733	CHAK 47	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.928	2026-08-01 08:22:18.213
ee05626d-61ff-488f-a75d-08259bff866e	01742	CHAK 84	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.93	2026-08-01 08:22:18.215
a88ee17b-88d6-4ddd-b7fb-c8dcdb7109ac	00087	CHAK 98 / F	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:05.932	2026-08-01 08:22:18.22
7a7d7a26-b5dd-4c8e-ade0-6e3a37d02d40	00088	CHAK ABDULLAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:05.934	2026-08-01 08:22:18.226
b64d00e4-27cc-470e-80f1-e12903eabd56	00555	CHAK AKKA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.936	2026-08-01 08:22:18.228
d4fb1a54-9816-444b-b99c-43defc555580	00191	CHAK BAQAR SHAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.938	2026-08-01 08:22:18.23
07662a36-1218-4584-af90-e719714cfb09	01179	CHAK BAZAAR(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:05.94	2026-08-01 08:22:18.235
a74ab7c7-3946-48c8-8dbf-f8bcedc013e1	00192	CHAK BELI KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.943	2026-08-01 08:22:18.237
59ff8eba-931b-4d67-803e-0f2b7d4b07a0	00193	CHAK CHAKORA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.945	2026-08-01 08:22:18.24
dd1e476f-c0dc-4ed0-9465-467bf32f2bb1	00556	CHAK DOLAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.947	2026-08-01 08:22:18.242
0bc63d7c-8e88-4e56-8f7a-b21da0666fe9	00557	CHAK JAMAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.949	2026-08-01 08:22:18.244
e9098b69-6ae6-46a7-96fb-bf40713d3581	00324	CHAK JHUMRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	FAISALABAD	t	2026-07-29 09:18:05.951	2026-08-01 08:22:18.248
20fb1b4d-bff4-449d-bdd7-e0dd2b59d79c	00706	CHAK KAMAL(SEHN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:05.955	2026-08-01 08:22:18.274
da37460e-1cb5-4952-a258-86dee13494d3	00558	CHAK KHASA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:05.957	2026-08-01 08:22:18.279
000beeae-f84b-450f-af0d-683ac9938c17	00707	CHAK MEHMAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:05.959	2026-08-01 08:22:18.282
4a4846dc-7a4e-4d11-b556-3c67ad59d8a4	00089	CHAK MIDDRSA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:05.961	2026-08-01 08:22:18.286
e40d126b-df8f-470c-a219-1df8a6480782	00194	CHAK NARANG	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.963	2026-08-01 08:22:18.288
4c9b9a64-7d3e-453c-9a2a-4719ee9073e4	01683	CHAK PIRANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:05.965	2026-08-01 08:22:18.29
79b71970-cbb6-4242-980c-9bbe169c24f4	00267	CHAK SWARI(A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:05.967	2026-08-01 08:22:18.293
c334b6e7-30a3-4b8b-be89-810849c281b8	01046	CHAKAR (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:05.969	2026-08-01 08:22:18.295
d4862d2a-3671-4b14-a8bd-4607eb6a03fd	00731	CHAKAR KOT KOHA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:05.971	2026-08-01 08:22:18.297
1e139467-1ad4-4dee-a6be-bb8dd641c3be	00124	CHAKDARA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.973	2026-08-01 08:22:18.299
048504cf-32cd-479e-9208-6c218e33ddf8	01209	CHAKLALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:05.975	2026-08-01 08:22:18.302
395bcdc4-1b15-452d-abbd-7e507f666aa2	00195	CHAKORA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.977	2026-08-01 08:22:18.304
3d51f92e-cd19-451a-83d6-86219109f1cd	01047	CHAKOTHI (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:05.98	2026-08-01 08:22:18.306
60b2fbfc-d530-446e-81d7-6eedc9b43fdf	00196	CHAKRAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.982	2026-08-01 08:22:18.308
d36982fb-8c5c-431b-aa18-ad6272c5b22d	00197	CHAKRI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.984	2026-08-01 08:22:18.31
74dad0ed-0d41-44c9-9dfc-392c3e755452	00180	CHAKWAL	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	CHAKWAL	t	2026-07-29 09:18:05.986	2026-08-01 08:22:18.312
caa42d30-3c67-4059-a824-d368e71b813d	01154	CHAMAN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:05.988	2026-08-01 08:22:18.314
3e890f11-0a28-4e79-a5b0-8b302baafaf8	01048	CHAMANKOT (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:05.99	2026-08-01 08:22:18.318
ee6e4662-189f-4226-bf1f-0b2f43484723	00198	CHAMBI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:05.992	2026-08-01 08:22:18.321
6c4cc3f0-3d71-4b70-b549-fa0579c404b3	00354	CHAMMAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.994	2026-08-01 08:22:18.323
62c46f43-220e-479d-87ea-0f1540f100af	00708	CHANAN GAKKHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:05.997	2026-08-01 08:22:18.325
88cac02b-fbd4-4de1-9b45-d17f91dbe43f	02684	CHAND RAMI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:05.999	2026-08-01 08:22:18.327
17e647a6-d642-452d-8360-31c080fa7c25	00355	CHANGA BANGIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.001	2026-08-01 08:22:18.346
e93a45e8-7a5f-4c5e-b7f3-ef6395c4555e	00136	CHANGA MANGA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAI PHERU	t	2026-07-29 09:18:06.003	2026-08-01 08:22:18.348
a2f54f07-b07a-4c93-9953-78178607a590	00853	CHANI GOTH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LIAQATPUR	t	2026-07-29 09:18:06.005	2026-08-01 08:22:18.351
b6c19917-c8b9-4878-8a8f-f826eca8a6a0	00559	CHAPARAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.007	2026-08-01 08:22:18.364
ba520b64-3c10-4b0a-99e8-b544d6e19339	01180	CHAPPRI (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.009	2026-08-01 08:22:18.367
2b077ce3-414a-4a8d-ade4-3c95e0c1aa6b	00966	CHAR BAGH (SWAT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:06.012	2026-08-01 08:22:18.369
18dd787e-e662-44e1-a37c-5f92bb81954f	00684	CHAK 12 AH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:05.909	2026-08-01 08:22:18.186
fb709b2b-d5a8-4ef2-9610-bd123bff12b6	00942	CHASHMA COLNY.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.018	2026-08-01 08:22:18.378
3681e87b-3622-4a4e-848d-1985ca983bbd	00943	CHASHMA(WAPDA-A	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.02	2026-08-01 08:22:18.381
317f2556-6ad2-486d-848f-5c2567780723	00888	CHATTAR PLAIN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:06.024	2026-08-01 08:22:18.388
e04c9077-2694-408f-9448-197f69c928cf	01131	CHAWINDA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	PASRUR	t	2026-07-29 09:18:06.026	2026-08-01 08:22:18.391
6c6212f1-80e6-4555-a28c-b96300542858	00977	CHECHIAN (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:06.029	2026-08-01 08:22:18.393
6ca73821-1b44-4919-8f57-8172c9af3793	09011	CHENAB NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	RABWA (Chenab N)	t	2026-07-29 09:18:06.033	2026-08-01 08:22:18.398
c36731f4-cb5b-42e1-b125-845ed0cf74b5	01210	CHHUB	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.035	2026-08-01 08:22:18.401
4722bff6-6fb1-47c1-8224-0ff677ce5a76	00248	CHICHA WATNI	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	CHICHA WATNI	t	2026-07-29 09:18:06.037	2026-08-01 08:22:18.404
720db332-62a4-4271-91d2-91812567dd90	00329	CHILAS	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GILGIT	t	2026-07-29 09:18:06.039	2026-08-01 08:22:18.41
1e6be71e-fd31-4539-8613-e8311fadfe87	01051	CHINARI (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.041	2026-08-01 08:22:18.413
ad3c1707-2c20-4a76-ba24-b91a59a280f4	00254	CHINIOT	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	CHINIOT	t	2026-07-29 09:18:06.043	2026-08-01 08:22:18.415
3c2d7606-2ca1-454e-ac0b-d038a0239db5	01388	CHINJI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:06.046	2026-08-01 08:22:18.419
325c1035-fa2b-408c-8073-d0300c6b8c39	00084	CHISTIAN	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BAHAWALNAGAR	t	2026-07-29 09:18:06.048	2026-08-01 08:22:18.422
3a9fc9cd-04c7-48fe-a377-347e0a57fedd	00256	CHITRAL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	CHITRAL	t	2026-07-29 09:18:06.05	2026-08-01 08:22:18.424
b58400aa-d8f0-4644-96c0-be63919a4dfb	00978	CHITTAR PARI	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:06.052	2026-08-01 08:22:18.427
9d34f18b-403b-48b1-91cd-67689f0a6221	00560	CHOA KARYALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.054	2026-08-01 08:22:18.429
0c79e8ae-b775-4f9a-8f52-b6e904c18795	00356	CHOA KHALSA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.056	2026-08-01 08:22:18.431
6a856970-1836-4be5-93d6-7e9e9ea227da	00199	CHOA SAIDAN SHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.058	2026-08-01 08:22:18.434
659db67a-edec-47b9-9cda-46a3cd62fecd	00840	CHOBARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.06	2026-08-01 08:22:18.436
f8133837-769c-4e07-9af6-756f5a7fbf23	01418	CHOHAR JAMALI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	THATTA	t	2026-07-29 09:18:06.062	2026-08-01 08:22:18.438
a8444325-95c6-4afc-9d8e-2c83aecb9477	00674	CHOMKO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:06.064	2026-08-01 08:22:18.441
8b33c44d-855a-4d1e-9c94-fc42640de533	00927	CHOPAR HATTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:06.066	2026-08-01 08:22:18.444
d79202a0-e1d9-443f-9959-8f652026ec19	00758	CHORAI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.068	2026-08-01 08:22:18.446
290a8bc6-2954-49c3-8729-0c472285e47d	00561	CHOTALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.07	2026-08-01 08:22:18.448
8cc51340-ef2a-4bf4-b5b6-96c3b66374b4	00296	CHOTI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:06.072	2026-08-01 08:22:18.45
a3474161-d4da-4431-a5a3-c35b9e308ed2	01181	CHOTTAGLA (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.074	2026-08-01 08:22:18.453
2d97311a-d28b-4682-863d-9cd7825e9190	00200	CHOUNTRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.076	2026-08-01 08:22:18.455
d4d4b198-b736-4f0a-abf7-ac730e916711	00841	CHOWK AZAM	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	LAYYAH	t	2026-07-29 09:18:06.079	2026-08-01 08:22:18.457
dca920d4-6ad7-4070-a67f-2806ba3b965a	02688	CHOWK BAZAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.081	2026-08-01 08:22:18.459
59fcaecc-9617-4f9e-b389-8462731760ab	02675	CHOWK MUNDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:06.083	2026-08-01 08:22:18.461
70096272-34dc-4aea-85a1-a19a8e5d4aff	00357	CHOWK PANDORI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.085	2026-08-01 08:22:18.463
8b3d5d45-0c2d-462f-bd46-d7238cfbc04d	01070	CHOWK PERMIT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:06.087	2026-08-01 08:22:18.465
6898c081-7e00-42e7-ba2e-7aed6d2ab16b	01071	CHOWK SARWAR SHAHEED	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:06.089	2026-08-01 08:22:18.468
f8327557-1126-4f04-930d-50deaa4f1c20	00157	CHOWKI  (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:06.091	2026-08-01 08:22:18.47
ed849521-b660-4b41-b609-172f6a40403e	01731	CHOWKI BHAGAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.093	2026-08-01 08:22:18.473
ba199377-0858-4e63-a728-4cbc5500d70b	00928	CHUB CHOUKI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:06.095	2026-08-01 08:22:18.476
0a8192a9-6a5b-416c-bb26-62c93e170a9b	02614	CHUCHAK	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:06.097	2026-08-01 08:22:18.48
f14d8b83-eddc-4598-8a68-5dccff620eff	00544	CHUND	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:06.099	2026-08-01 08:22:18.486
7f1e9efd-1874-4889-9190-8ad0230abd84	02622	CHUNDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:06.101	2026-08-01 08:22:18.489
8137843f-94bd-4ded-992b-010ab805a81c	00682	CHUNDIKO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:06.103	2026-08-01 08:22:18.491
1beb4507-37db-4042-ac0b-df83f2922fea	00805	CHUNG	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:06.106	2026-08-01 08:22:18.494
8db14dbc-ae57-45c1-9be5-6e81ca67bf0a	01136	CHUNIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:06.107	2026-08-01 08:22:18.496
323a4487-d299-4839-aa10-aac5e7c9fb43	00889	COLLEGE DHORAHA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:06.11	2026-08-01 08:22:18.501
117aff5c-a0ad-43d2-876c-172882d0ef1a	00732	COLLEGE TOWN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:06.112	2026-08-01 08:22:18.504
63c5f92d-29af-47f3-ad2a-eabf09659533	02626	DAD FATIYANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHICHA WATNI	t	2026-07-29 09:18:06.114	2026-08-01 08:22:18.508
7e1bec48-4a92-4f4f-8416-4c9bac8c0134	01007	DAD LAGHARI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR MATHELO	t	2026-07-29 09:18:06.116	2026-08-01 08:22:18.548
2c64be7c-df8c-49d5-8182-c36da0fff03c	00258	DADU	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	DADU	t	2026-07-29 09:18:06.118	2026-08-01 08:22:18.559
619a5f53-9d9c-45ff-a2fb-4f201777a634	00941	CHASHMA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.016	2026-08-01 08:22:18.374
8273c6e6-4898-45b7-81f7-ddd03b200397	00143	DAGGAR REHTAS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:06.125	2026-08-01 08:22:18.571
6210bd83-abbd-40f7-84ed-c516de559c07	00201	DAHEWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.127	2026-08-01 08:22:18.573
5562eeaf-0e25-43f8-8999-9baa0d96a2fb	00004	DAHMTORE	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.129	2026-08-01 08:22:18.575
bf52eae3-b2aa-4167-bfb1-4ebdbfff908a	00748	DAIRA DIN PANNA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:06.132	2026-08-01 08:22:18.577
71327936-1c23-4134-847f-d85891c9674f	02636	DAKHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:06.134	2026-08-01 08:22:18.58
f91b955a-efd5-4610-91d1-845a5ca50545	01312	DAKWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:06.136	2026-08-01 08:22:18.584
3d870d37-eae7-42db-8cf6-2fbc48f85eff	01155	DALBANDIN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:06.138	2026-08-01 08:22:18.587
02b40753-6cf8-4f7d-a9c8-aca8fb9839a6	00202	DALWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.14	2026-08-01 08:22:18.589
0d812dbd-f9f9-43b3-bed2-229509973ac6	00759	DAMMAS (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.142	2026-08-01 08:22:18.591
ce5b834d-c001-4de3-bae5-900dbf7484c7	01389	DANDA SHAH BILA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:06.144	2026-08-01 08:22:18.593
1379b0c1-6775-4023-9167-2ecee83b102c	00562	DANDI DARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.147	2026-08-01 08:22:18.595
1a901bbc-9022-4ede-87ad-895a576393c1	01805	DANDI NIZAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.149	2026-08-01 08:22:18.597
cdf8765e-e4df-421a-95fc-261efcbca9b2	00760	DANDLI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.151	2026-08-01 08:22:18.601
01016ecc-69f3-41d2-b350-d38210d8cf41	00723	DANDOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHEWRA	t	2026-07-29 09:18:06.153	2026-08-01 08:22:18.603
ed5790c7-4948-44d0-836d-443dadafbbf8	00040	DAR-UL-ISLAM CO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.155	2026-08-01 08:22:18.605
f6f193fe-5beb-42c2-8e8a-dc0976d20d2f	01142	DARA ADAM KHEL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	PESHAWAR	t	2026-07-29 09:18:06.157	2026-08-01 08:22:18.618
ae00db79-6ceb-49b3-8d85-274a8c0b0d6a	01773	DARBALA JALAB	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:06.159	2026-08-01 08:22:18.62
f5d61550-5692-4bb5-a3a7-340013afe509	00125	DARBAR(HAJIABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:06.161	2026-08-01 08:22:18.623
ed6b8564-1e97-4083-b15c-c1e6c211db84	01117	DARBELLO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:06.164	2026-08-01 08:22:18.625
962ef7e2-07e8-400c-bc94-6e16fc81d266	01377	DARGAI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TAKHT-E- BHAI	t	2026-07-29 09:18:06.166	2026-08-01 08:22:18.627
803e2983-3934-42ce-b56b-baaf4ceb5718	01403	DARRORA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:06.168	2026-08-01 08:22:18.629
99ada9bf-0a92-4f91-b3f6-f58384891832	00257	DARROSH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	CHITRAL	t	2026-07-29 09:18:06.17	2026-08-01 08:22:18.631
62967261-8e9b-4074-9ba6-803c6a9f2e78	00451	DARWESH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:06.172	2026-08-01 08:22:18.635
20c1af46-d713-42a2-8ff8-3882de4da0b2	00144	DARYA KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:06.174	2026-08-01 08:22:18.636
87010ed1-6b44-4521-8d28-8bdc0001ef4c	01118	DARYA KHAN MARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:06.176	2026-08-01 08:22:18.639
2b6b3c73-2636-4ba0-99d8-bc724d79ac3f	00282	DASKA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	DASKA	t	2026-07-29 09:18:06.178	2026-08-01 08:22:18.641
d1ce049a-148a-46a1-988b-15282915df1b	00944	DAUDKHEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.182	2026-08-01 08:22:18.644
3f65a8be-fdd5-4229-9fb8-75762869686e	00358	DAUL TALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.184	2026-08-01 08:22:18.646
0ba35778-3221-4d05-b96f-49a63275ced9	02509	DAULAT PUR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:06.186	2026-08-01 08:22:18.648
6fa096a1-b0b9-4f11-a727-3a217229e8ee	00433	DAULATNAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.188	2026-08-01 08:22:18.652
db19687f-0aea-46c2-addf-372276af7555	00434	DAULATPUR SAFAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.19	2026-08-01 08:22:18.654
4aa237bf-d144-4b95-82b3-216f13132b06	01093	DAUR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:06.193	2026-08-01 08:22:18.656
67f1e5ee-a0b1-4798-837e-6509076a271a	02620	DEEN PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:06.195	2026-08-01 08:22:18.658
badc5900-6945-4cb1-bddc-6f01c346e68b	00563	DEENA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.197	2026-08-01 08:22:18.66
a29bffb4-1ced-4421-97d9-637b4d236bc5	02686	DEHBEHERO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.199	2026-08-01 08:22:18.662
0bd5374c-5618-495b-a27c-942f1c025207	00203	DEHE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.201	2026-08-01 08:22:18.663
39c6bb18-246a-4b6f-b6f8-aceb35475f66	00814	DEONA MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LALAMUSA	t	2026-07-29 09:18:06.203	2026-08-01 08:22:18.666
bee79643-c0f9-4f1a-82d7-b448e31e3f31	01126	DEPALPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	OKARA	t	2026-07-29 09:18:06.205	2026-08-01 08:22:18.668
ea84a741-7292-43a4-b95c-f1a29e0f16fb	01328	DERA ALLAH YAR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.207	2026-08-01 08:22:18.671
98f66bbd-ae75-4406-b2d5-3fa899607093	02653	DERA BAKHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:06.209	2026-08-01 08:22:18.673
e671e808-a65d-4203-a25a-ef1165522637	04040	DERA BUGHTI	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:06.211	2026-08-01 08:22:18.711
4f4b812d-9e0c-4cc2-8492-56936f7557ab	00293	DERA GHAZI KHAN	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	DERA GHAZI KHAN	t	2026-07-29 09:18:06.214	2026-08-01 08:22:18.748
20be1567-b1ea-4d4b-a14d-49731f4bbbeb	00306	DERA ISMAIL KHAN	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	DERA ISMAIL KHA	t	2026-07-29 09:18:06.217	2026-08-01 08:22:18.792
820e3054-87dc-4625-9212-ba889e43a7d9	01284	DERA MALLAH SIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:06.219	2026-08-01 08:22:18.808
661270ca-46e8-4b93-9b27-327d8f04bbfc	01329	DERA MURAD JAMA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.221	2026-08-01 08:22:18.837
bd6e973f-840b-4702-aa07-7faefe234dcf	00761	DEWAN SHARIF (A	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.223	2026-08-01 08:22:18.891
f195bd37-f301-4ffb-ac19-8875a20c8e4e	00172	DEWANA BABA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:06.225	2026-08-01 08:22:18.913
a508ddc1-8827-4feb-8fb1-792c2e09fb2e	00204	DHAB KALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.227	2026-08-01 08:22:18.935
4fa3f08f-0824-4a98-a107-5db1a7864847	00171	DAGER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:06.123	2026-08-01 08:22:18.568
74070e13-6d9e-4cb5-b87e-05a455873970	00359	DHAMIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.236	2026-08-01 08:22:18.947
1ac11f85-2d30-42b1-ba77-6588ddf3d59b	01285	DHAMKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:06.238	2026-08-01 08:22:18.952
8aa777a9-f5f2-46a5-afc2-4c321380f1b2	01085	DHAMTHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:06.24	2026-08-01 08:22:18.954
d2b8cc2c-d886-4fcc-9cb5-a5ddb1deb117	00158	DHANDER (KALAN)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:06.242	2026-08-01 08:22:18.957
fe363f67-388c-4d4f-8d57-0959df172ecf	00268	DHANGRI BALA (A	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.244	2026-08-01 08:22:18.959
9fd82b01-0ccc-47ff-ab63-9e4f080045d3	01052	DHANI BOMBIAN	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.247	2026-08-01 08:22:18.961
e960eba9-10f7-456b-b1b5-6057c8fa9ede	02644	DHANOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:06.249	2026-08-01 08:22:18.962
9c099743-79b7-4fc9-a9e9-be4903f90591	01724	DHARAMKOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:06.251	2026-08-01 08:22:18.964
a93f7666-5b97-4d79-874c-d82c9d364e1e	01736	DHARANKA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.253	2026-08-01 08:22:18.968
1d47e466-1f48-495c-a4a5-e4d3eb9a6d8f	00090	DHARANWALA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	BAHAWALNAGAR	t	2026-07-29 09:18:06.255	2026-08-01 08:22:18.974
2daab84c-c615-463c-94d1-b1b31283adff	01008	DHARKI	Sindh	09c212e9-7926-4cb7-aac4-6be051ef9e3d	MIRPUR MATHELO	t	2026-07-29 09:18:06.257	2026-08-01 08:22:18.976
ea9fee8c-9a73-460d-bf6a-bb427a68fcc9	00205	DHEEDWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.259	2026-08-01 08:22:18.978
e5058dd6-ab3b-4b27-ac02-09e7e0f8436e	01146	DHERI ARAIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PIND DADAN KHAN	t	2026-07-29 09:18:06.261	2026-08-01 08:22:18.98
a87a89e9-87ef-4a94-b983-205804fe546f	00126	DHERI JULAGRAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:06.264	2026-08-01 08:22:18.984
740ee990-d88c-4055-94ac-97ac3b382f2f	04015	DHERO NARO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:06.266	2026-08-01 08:22:18.986
d91afb14-d7fd-494a-840d-772d57870eef	01053	DHIRKOT (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.268	2026-08-01 08:22:18.989
f0dfe223-75d3-4755-a3d6-634690cb296d	00206	DHODA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.27	2026-08-01 08:22:18.991
84391ca2-d791-418c-a53a-f7cda2d17b48	00159	DHOK DAURA (A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:06.272	2026-08-01 08:22:18.993
678c11dc-557d-4eed-ad74-7523a1bdf67d	00207	DHOKE BADIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.274	2026-08-01 08:22:18.996
c401707d-ebad-4e08-9852-0b9402d3a91d	00041	DHOKE FATEH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.276	2026-08-01 08:22:19.002
07765907-bb77-4f30-8cf3-b48bb430a3b8	00208	DHOKE MAKEN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.279	2026-08-01 08:22:19.036
84d2c86c-6cc9-41bf-a3d6-1dca739daf9e	00710	DHORIA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:06.281	2026-08-01 08:22:19.055
61b3b849-b121-47f4-a346-829002545da3	00209	DHUDIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.283	2026-08-01 08:22:19.144
58a9a0e5-5697-4091-bfc0-6a969f1ffeb7	00711	DHUNNI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:06.285	2026-08-01 08:22:19.247
27f5d0ee-d38b-40e3-bc2c-41ee200951c3	00210	DHURKANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.287	2026-08-01 08:22:19.4
b3e6ed9f-40c3-4cdd-9694-2d2046d88de2	02505	DHURNAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.289	2026-08-01 08:22:19.462
bb4f0c89-a404-4521-9e6d-c9a3bb4cd26c	00990	DIGRI	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	MIRPUR KHAS	t	2026-07-29 09:18:06.291	2026-08-01 08:22:19.501
2a4c411e-6bfd-45a3-8ccd-183ce36958b8	01247	DIJKOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:06.294	2026-08-01 08:22:19.518
f581d210-b354-4307-adb6-d1b788e66790	00712	DINGA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	KHARIAN	t	2026-07-29 09:18:06.296	2026-08-01 08:22:19.53
a175bcbf-0231-43e7-92a5-e1d578d104a5	01400	DIR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:06.298	2026-08-01 08:22:19.537
6ebabddb-7fae-4b9e-866f-6048d7205d27	00211	DISTT. COMPLEX	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.3	2026-08-01 08:22:19.588
10669bda-cf1f-49a6-8fd9-90e72cdf6c7d	00733	DOABA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:06.302	2026-08-01 08:22:19.658
21fc8bef-50ed-4b35-ba2c-f69d7506bc05	00360	DOBERAN KALLAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.304	2026-08-01 08:22:19.661
5be7e61a-a973-4c4f-9bf5-340a46313a99	00842	DOHRI ADDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.306	2026-08-01 08:22:19.734
87bca9be-c106-467e-97ff-7cdbc1d5af36	01436	DOKOTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:06.309	2026-08-01 08:22:19.785
3ca1ebe7-21bb-4b20-973d-0749bf5840cc	00822	DOKRI	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	LARKANA	t	2026-07-29 09:18:06.311	2026-08-01 08:22:19.836
d3410b92-4d26-49e7-a835-dc7103f23951	02635	DOLAT PUR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.313	2026-08-01 08:22:19.855
fd752881-347f-4126-bc08-e540c154a3b4	02659	DOLTALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:06.317	2026-08-01 08:22:19.895
23c9002d-2c1e-40ee-a1f7-8364986f1548	00112	DOMAIL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:06.319	2026-08-01 08:22:19.962
574e159f-1b90-4304-ad38-60834daa8258	01211	DOMEAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.321	2026-08-01 08:22:19.97
fc22a4ea-4292-46fc-922a-2f63ea6ccac4	00091	DONGA BONGA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:06.323	2026-08-01 08:22:19.979
775d4fee-b728-4da4-a016-2767f537da42	00762	DONGI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.325	2026-08-01 08:22:20.039
a8a7b1b7-7f29-4255-bb25-b5f38e0ead30	00212	DOREY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.328	2026-08-01 08:22:20.099
0f9ccd97-781b-4221-b1c0-258257b41f33	00508	DOREY WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.33	2026-08-01 08:22:20.101
7cbbddf3-d562-4a9b-b660-9ba487c45910	00307	DRABON KALAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:06.332	2026-08-01 08:22:20.104
acc3def9-1b4e-4e20-a445-97d0a569dda4	00361	DUDDIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.334	2026-08-01 08:22:20.172
11fb325a-2755-40e3-b726-937316cc611a	00145	DULEWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:06.336	2026-08-01 08:22:20.195
e2f0c1bb-8bda-4ee9-b2ba-11509f692d6b	00101	DUNYA PUR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	BAHAWALPUR	t	2026-07-29 09:18:06.338	2026-08-01 08:22:20.244
a1bfb8fe-f094-4b49-beab-b9f765c4de0f	01330	DHADAR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.232	2026-08-01 08:22:18.943
cc39643f-b334-42e2-b7dd-3db25ce2bc08	00269	EISER (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.346	2026-08-01 08:22:20.462
a209f8d9-3bd4-4c3c-bf58-bf2c7173b4d6	01717	ESSA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:06.348	2026-08-01 08:22:20.518
231f02b0-a1a6-4390-976a-644c21c42233	00322	FAISALABAD	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	FAISALABAD	t	2026-07-29 09:18:06.35	2026-08-01 08:22:20.524
c80128c4-4aca-4a93-ac0c-89bec5f034b5	02621	FAIZ GUNJ	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:06.352	2026-08-01 08:22:20.541
4ef02051-0ad9-4de4-abd7-e761a3e42212	01286	FAIZPUR KHURD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:06.354	2026-08-01 08:22:20.55
87d03b96-9adb-4fc0-9b68-50f1d1c9e54b	00092	FAQIR WALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:06.356	2026-08-01 08:22:20.574
0bbdeffa-f75c-4049-bd30-7bdf1ff4e210	02506	FAQIRABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.358	2026-08-01 08:22:20.593
b6ed0629-575b-4938-8bde-34c0eece0534	01266	FAROOQA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:06.36	2026-08-01 08:22:20.614
84094059-dac2-4287-8854-317b6303efbc	01287	FAROOQABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:06.363	2026-08-01 08:22:20.626
9376c650-de08-4bcd-a541-4d8a579ddfdd	01445	FAROOQIA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAH CANTT.	t	2026-07-29 09:18:06.365	2026-08-01 08:22:20.641
e195bafc-9b00-4e26-926e-b6e71754e6d2	01203	FATEH JANG	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	RAWALPINDI	t	2026-07-29 09:18:06.367	2026-08-01 08:22:20.65
7959edf9-07d7-4f6f-a3eb-3b7ede1993c0	02671	FATEH PUR KAMAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.369	2026-08-01 08:22:20.657
43b8bbe5-d3ea-4908-a5d5-02984c6b3c48	00435	FATEHPUR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	GUJRAT	t	2026-07-29 09:18:06.371	2026-08-01 08:22:20.679
4ca40f55-8a2c-4611-b614-ab2590d41acb	00843	FATEHPUR (CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.373	2026-08-01 08:22:20.694
bf5810c7-689a-485f-b039-4263403d52cd	00297	FAZILPUR DHUNDH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:06.374	2026-08-01 08:22:20.743
1a7c411f-7f3f-4a47-baf5-1d5866f48a56	01288	FEROZ WATWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:06.377	2026-08-01 08:22:20.778
571fe8bc-2d26-4362-8a1d-19bdd70bf66a	00698	FEROZA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANPUR	t	2026-07-29 09:18:06.379	2026-08-01 08:22:20.78
47287394-2894-414c-a659-472e81293a34	00806	FEROZWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:06.381	2026-08-01 08:22:20.804
68bd98a6-bf0d-428c-97b3-866948e3e797	00967	FIZA GET (SWAT)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:06.383	2026-08-01 08:22:20.827
c7f02a22-27c2-4021-8168-e12c2dc8e11d	00093	FORT ABBAS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:06.385	2026-08-01 08:22:20.836
b8f2ce01-507a-4f82-ba5a-23ef083fc9a8	01790	G.S RASOOL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.387	2026-08-01 08:22:20.887
a20fa3c1-63dc-44dd-8571-d708e32149e4	01248	G.S.SUGAR MILLS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:06.389	2026-08-01 08:22:20.902
dd479536-b86f-4e10-82ae-33d38b7ccebf	00326	GADOON AMAZAI	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	GADOON AMAZAI	t	2026-07-29 09:18:06.392	2026-08-01 08:22:20.916
8f0699b7-4668-4fd9-a0c1-fcee7edd689c	00179	GAGGO MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUREWALA	t	2026-07-29 09:18:06.394	2026-08-01 08:22:20.928
d6f0f9d9-205c-4f5f-ab3d-9703352cdb5a	00328	GAHKUCH	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GILGIT	t	2026-07-29 09:18:06.396	2026-08-01 08:22:20.955
6dbb3b6a-84ab-494e-ab83-b11b3c219268	01456	GAKKHAR MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:06.398	2026-08-01 08:22:20.968
b8837b69-f2ba-4f6a-9c78-0e0d396920b1	01331	GAMBAT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.401	2026-08-01 08:22:21.098
60575ac8-1572-4e28-bb62-7011247aa879	02689	GAMBEELA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.403	2026-08-01 08:22:21.115
95c08896-9dca-418a-9d77-5690c1b5f972	02530	GAMBER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	OKARA	t	2026-07-29 09:18:06.405	2026-08-01 08:22:21.13
68f48c38-27bd-4de9-8593-00fa9d68d37e	02660	GANDA WAH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:06.407	2026-08-01 08:22:21.144
ca7a7217-83c3-4650-ae9b-e4bb4fb63f17	00545	GARH MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:06.409	2026-08-01 08:22:21.154
e123ae0f-bb2f-4934-9417-c404a856fbb6	01437	GARHA MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:06.411	2026-08-01 08:22:21.157
177e6b99-a0fa-4189-95c8-082712c1e3ae	01055	GARHI DOPATTA	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.413	2026-08-01 08:22:21.16
a4e7764b-6f27-4b76-9c88-cbe2377dc26d	00904	GARHI DOULAT ZA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.415	2026-08-01 08:22:21.162
00b916fc-c0db-4c9e-b5d5-db1620f10cd2	00891	GARHI HABIB ULL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:06.417	2026-08-01 08:22:21.235
137f16f1-b51b-43e5-85db-113206f5479f	01332	GARHI KHERO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.419	2026-08-01 08:22:21.239
e74311c4-ab61-4753-b336-8a6dc169678b	01333	GARHI YASIN	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.42	2026-08-01 08:22:21.243
e8dfe6c9-2e3e-4895-8693-3c58d9fc8b00	02662	GARI IKHTIYAR KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAN PUR	t	2026-07-29 09:18:06.422	2026-08-01 08:22:21.25
5306f67a-108f-4c77-a598-6b124760181c	00823	GARIH KHAIRO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:06.424	2026-08-01 08:22:21.256
e4d1287a-ebf4-4c98-bb5a-d415e3b1c335	00594	GAWADAR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	GAWADAR	t	2026-07-29 09:18:06.426	2026-08-01 08:22:21.263
7acdcfa7-9939-4de8-aaf3-629084edb8ee	02673	GHANI PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.428	2026-08-01 08:22:21.267
fa751899-9aa2-4c18-b2bf-de0e83e231a5	02628	GHARI HABIB ULLAH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:06.43	2026-08-01 08:22:21.273
8629a1a0-965d-4d5d-8c5c-a133af0db183	01334	GHARI MORI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.432	2026-08-01 08:22:21.277
3efb4407-ff7b-4e94-a09c-0788f219291a	01147	GHARIBWAL CEMEN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PIND DADAN KHAN	t	2026-07-29 09:18:06.434	2026-08-01 08:22:21.291
86b13a13-acef-4700-8ec2-4b6698a76ee5	00564	GHARMALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.435	2026-08-01 08:22:21.294
9f2dbbdb-8690-4970-8cae-c3f5bb95fe16	01703	GHARMORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.437	2026-08-01 08:22:21.304
3bd43570-6157-4f99-8f88-d219463fcbf8	01420	GHARO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	THATTA	t	2026-07-29 09:18:06.439	2026-08-01 08:22:21.307
bf35f4b8-f777-4724-bcfb-1c46bd021b38	00042	GHAZI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.441	2026-08-01 08:22:21.316
dbe5d56e-4245-4024-bd8c-c94f79b4df9e	01054	EIDGAH ROAD	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.343	2026-08-01 08:22:20.458
ff6708f5-4ecd-48c4-9657-b0b730d7eea2	01029	GHIKA GALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:06.447	2026-08-01 08:22:21.335
f620754b-97e5-4be7-bf8e-3e8e31d0ecc9	01212	GHMAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.449	2026-08-01 08:22:21.342
37bff6f8-2630-4c2b-a57f-afe9b2d33d78	01005	GHOTKI	Sindh	09c212e9-7926-4cb7-aac4-6be051ef9e3d	MIRPUR MATHELO	t	2026-07-29 09:18:06.451	2026-08-01 08:22:21.35
c9e0df4c-485d-4d45-9b9e-8cf86c625e7c	00043	GHOUR GHUSTI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.452	2026-08-01 08:22:21.355
fa51cbbc-d5af-421f-837c-80ea0592dda8	02603	GHOUS PUR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:06.454	2026-08-01 08:22:21.359
cbfdc4e2-04ef-4992-9079-98e61b85b680	01313	GHUENKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:06.456	2026-08-01 08:22:21.369
583b1ff5-f9fa-4bbb-ba43-1d2e36c3f315	01365	GHULAM ISHAQ UN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:06.458	2026-08-01 08:22:21.379
6f0e3657-3d5c-4312-90a2-72d5f5e766ae	01030	GHULEHRA GALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:06.46	2026-08-01 08:22:21.385
fd88386a-73e9-4a38-b1d8-e87bccc7b4d3	00407	GHUMAN WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.462	2026-08-01 08:22:21.399
15206a63-05a7-4e6d-bea0-2512355f3377	00815	GHURKO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LALAMUSA	t	2026-07-29 09:18:06.464	2026-08-01 08:22:21.405
f8319de9-824a-4ce4-9a1d-b9c56f724240	00619	GIDANI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:06.466	2026-08-01 08:22:21.408
c606c602-335e-428c-af3c-bb6cd9a73867	00327	GILGIT	Gilgit-Baltistan	58dae26b-44d2-43ac-9424-1a7926196e32	GILGIT	t	2026-07-29 09:18:06.468	2026-08-01 08:22:21.411
a865f5a5-7b58-42b6-adf0-ae050fab2b61	00283	GLOTIAN MORR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:06.47	2026-08-01 08:22:21.429
1e485684-2909-4f57-a359-9e365ef173c3	01747	GOCH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:06.471	2026-08-01 08:22:21.433
aa59276d-38ce-4f59-84ec-b84e958bc1e3	00502	GOGERA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.473	2026-08-01 08:22:21.436
ee130651-c3b2-4873-88c5-b333ef0b1ad5	00005	GOHARABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.475	2026-08-01 08:22:21.452
0e6f8bec-9d76-464d-ba7d-5b8dc34e1ffd	00763	GOI	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.477	2026-08-01 08:22:21.469
f5c92483-adbf-4085-998c-7a3941b37140	00334	GOJRA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	GOJRA	t	2026-07-29 09:18:06.479	2026-08-01 08:22:21.474
091be849-48d3-4d43-8e99-b53f7ce50f68	00863	GOJRA ( MANDI B	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:06.481	2026-08-01 08:22:21.476
9607672f-2ff7-4790-b75c-b7c83ea87916	00075	GOLARCHI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	BADIN	t	2026-07-29 09:18:06.483	2026-08-01 08:22:21.479
64756313-d031-46db-89ec-da59a7c038fa	00044	GONDAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.486	2026-08-01 08:22:21.508
053511c7-858f-4d28-baee-3e386c8d9c37	01686	GOPAL PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.488	2026-08-01 08:22:21.511
41bf2f9a-f2fc-44fc-9124-73a16ca57ed9	01230	GOTH MACHI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.49	2026-08-01 08:22:21.532
e48999fc-2b85-47d8-be2a-ebb015e85852	00509	GROAT SHEHAR/CA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.491	2026-08-01 08:22:21.553
074c6c45-5854-4c8a-8010-81a5feaef930	01231	GUDDU (THERMAL)	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.494	2026-08-01 08:22:21.566
aefbfcce-859e-4971-bb57-34bc3e604263	00905	GUJAR GARHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.496	2026-08-01 08:22:21.583
0c8f5610-4749-4cee-8efb-2a68c0a4996a	00344	GUJAR KHAN	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	GUJAR KHAN	t	2026-07-29 09:18:06.497	2026-08-01 08:22:21.64
d43137a8-5045-4564-8150-f37e26edde09	00565	GUJARPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.499	2026-08-01 08:22:21.724
1415d497-3853-4b6e-8bdb-9267424c88f3	00399	GUJRANWALA	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	GUJRANWALA	t	2026-07-29 09:18:06.501	2026-08-01 08:22:21.855
a992cc8a-fefe-4db6-ad00-18645fbdda9f	00426	GUJRAT	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	GUJRAT	t	2026-07-29 09:18:06.503	2026-08-01 08:22:21.912
ce375ded-158e-42b6-8a52-e4c76247d5f4	00906	GUJRT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.504	2026-08-01 08:22:21.959
e4f0312c-805a-4749-8ea6-fe68b6adc70d	00127	GULABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:06.506	2026-08-01 08:22:21.989
7800b42b-cf99-4e59-9bbd-a84f7790140e	00946	GULAN KHEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.508	2026-08-01 08:22:22.034
bbdf86f9-ce98-4834-be9c-3bc0a8314a35	00764	GULPUR (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.51	2026-08-01 08:22:22.055
974f581b-94f7-4722-9547-7f3b0c29460e	00362	GULYANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.512	2026-08-01 08:22:22.084
83b44c95-b651-4024-9eb4-a9fa6ad1c5d4	00713	GULYIANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:06.514	2026-08-01 08:22:22.102
9a2b620e-e57f-46e3-bd12-2663db503120	00734	GUMBAT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:06.516	2026-08-01 08:22:22.107
0dbf6a8f-0e4a-45c6-81ec-5fb270717b70	00968	GUMBAT MERA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:06.518	2026-08-01 08:22:22.111
550ab505-0408-4793-8051-4679b9fb90da	01457	GUNNUNWALA MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:06.557	2026-08-01 08:22:22.119
b0620ad9-7a35-449f-a3ae-1282b6fca2d4	02519	HABIB ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:06.56	2026-08-01 08:22:22.123
a5c5e786-a4e5-4fd5-9d62-5bce678b504b	02613	HABIBABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:06.563	2026-08-01 08:22:22.125
cdf1df06-76c1-42af-b174-98fe71fe1625	00006	HABIBULLAH COLO	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.567	2026-08-01 08:22:22.133
f6860a51-b829-4185-bf0d-1e3cb1eae586	00510	HADALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.569	2026-08-01 08:22:22.14
7062551c-8326-4614-be38-6cd586e68471	00401	HAFIZABAD	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	GUJRANWALA	t	2026-07-29 09:18:06.571	2026-08-01 08:22:22.143
28b8ec79-2ce4-43c8-baa4-faeac5fc07e1	00045	HAIDRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.573	2026-08-01 08:22:22.152
be1ee405-ba76-40bd-ac62-bdb97fd57c75	01404	HAJI ABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:06.575	2026-08-01 08:22:22.157
62f699d2-7b55-4f34-aa72-65ffec2a0a13	00046	HAJI SHAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.578	2026-08-01 08:22:22.159
c3222442-6286-4017-9c7f-2e3eaa3b4916	00765	HAJIABAD (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.58	2026-08-01 08:22:22.162
6a4ff965-2c56-4bad-89d9-f2799d6746f5	00892	GHAZIKOT TOWNSH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:06.445	2026-08-01 08:22:21.325
dfa92d8e-dc9c-4f4c-8f4f-b5e868d4af93	00492	HAJIWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:06.586	2026-08-01 08:22:22.177
b0c1ad89-de70-4266-82e4-52e5f35d0f8e	01108	HAKIM ABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:06.588	2026-08-01 08:22:22.185
30c57749-edc5-4c37-b169-162c8d28cd42	00478	HALA	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	HYDERABAD	t	2026-07-29 09:18:06.59	2026-08-01 08:22:22.188
339180ab-19bc-4aea-a4d7-03018bbd1e65	01335	HALANI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.592	2026-08-01 08:22:22.191
f7c59586-ec76-4dcc-8630-cb83fbb5ca6b	00047	HAMID	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.594	2026-08-01 08:22:22.193
953379cb-2295-4bf6-ac16-0689af5ef243	00270	HAMID PUR (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.596	2026-08-01 08:22:22.196
907b2dd8-e6f6-4794-a3d6-4431b6812547	00048	HAMILAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.598	2026-08-01 08:22:22.205
dbd930a7-a30f-4ce6-9253-bfdddce43cc4	00725	HANGU	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:06.6	2026-08-01 08:22:22.208
36044c2d-baad-4dd2-917e-f53852d2c790	00250	HARAPPA STATION	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHICHA WATNI	t	2026-07-29 09:18:06.602	2026-08-01 08:22:22.21
abf8536f-7fa9-4988-8ae0-92d2a089e495	01378	HARI CHAND	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TAKHT-E- BHAI	t	2026-07-29 09:18:06.604	2026-08-01 08:22:22.212
4d3d7518-6384-4f52-a2c3-dc1344910679	01056	HARI GHEL	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.606	2026-08-01 08:22:22.22
daabb11b-067f-4e79-a5d0-da4671fff044	00864	HARIAH RAILWAY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:06.609	2026-08-01 08:22:22.222
480f1495-e8ff-4d3e-afaf-27b0bfc97232	00447	HARIPUR	Khyber Pakhtunkhwa	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	HARIPUR	t	2026-07-29 09:18:06.611	2026-08-01 08:22:22.225
1532ba35-6102-406a-93e6-34c88a0dfb36	00436	HARIYAWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.613	2026-08-01 08:22:22.227
ed5c2465-f0b7-4a75-9e87-f0edd83a50fd	01336	HARNAI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.615	2026-08-01 08:22:22.235
8e3770fe-136b-4fc3-a88e-8b84eab55b23	00363	HARNAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.617	2026-08-01 08:22:22.238
b473ccc5-f1d6-4e9f-9d8f-665765730de6	00007	HARNO	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.619	2026-08-01 08:22:22.241
01aad6d4-089d-4677-b4f0-38bf5d05b18f	01758	HARNOLI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.621	2026-08-01 08:22:22.244
aeb697b6-97b1-4901-a0e8-71940e811ac4	00085	HAROONABAD	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BAHAWALNAGAR	t	2026-07-29 09:18:06.623	2026-08-01 08:22:22.246
57e4fa51-98c3-4b67-be77-d3d67c49e454	01289	HASEEB WAQAS MI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:06.625	2026-08-01 08:22:22.252
13b3c431-fc0e-4bd4-a13d-8268f248bbb7	01438	HASILPUR	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	VEHARI	t	2026-07-29 09:18:06.627	2026-08-01 08:22:22.255
5bd4c710-4fda-462e-b71d-9ecdd25a39a5	01446	HASSAN ABDAL	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	WAH CANTT.	t	2026-07-29 09:18:06.63	2026-08-01 08:22:22.257
e5624f78-5098-4063-8137-8b8cea16ed8b	01379	HATHIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TAKHT-E- BHAI	t	2026-07-29 09:18:06.632	2026-08-01 08:22:22.261
9c8558fd-5df4-449c-8716-be0287b9ffb7	00824	HATI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:06.634	2026-08-01 08:22:22.504
81a4b587-6440-45b1-b360-20de9aa1688a	00049	HATTIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.638	2026-08-01 08:22:22.562
eb6db5fd-81af-461b-87d8-bd281299281b	01057	HATTIAN  (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.64	2026-08-01 08:22:22.636
109da5bd-3a70-4717-baa5-47f7255e5b46	01240	HAVELI LAKHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:06.642	2026-08-01 08:22:22.644
bf78bbeb-ed58-475f-a900-8d54954fd944	00453	HAVELIAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:06.644	2026-08-01 08:22:22.701
012aeec2-ee1e-4e8c-82de-c133f63230d2	01405	HAYA SERAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:06.647	2026-08-01 08:22:22.707
7cd1160c-70bc-4518-9b69-91b8e0be8498	01687	HAYATABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.649	2026-08-01 08:22:22.769
b85d59fd-f465-4b2a-9c7e-cbe915e0ef72	01680	HAZARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	HAZARA	t	2026-07-29 09:18:06.65	2026-08-01 08:22:22.778
e72216ca-b43f-4d3c-8c52-2b29f487d98e	01267	HAZOOR PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:06.652	2026-08-01 08:22:22.843
c26975c8-0f31-4c7b-b932-81450bdde82a	00050	HAZRO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:06.654	2026-08-01 08:22:22.848
60a5991d-7a0f-4796-bb85-2ea6cccb79e9	01249	HBL 226 G.B	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:06.656	2026-08-01 08:22:22.906
0f263f9f-a7a7-4299-92a1-fd0c88825391	00338	HBL 282 J.B	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:06.658	2026-08-01 08:22:22.908
49bd5af4-271f-40b1-bc74-a408575f5a54	01250	HBL 45 G.B	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:06.66	2026-08-01 08:22:22.926
42682fe4-6913-4d4b-9fb7-ba25b3f239c5	00137	HEAD BALOKI ROA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAI PHERU	t	2026-07-29 09:18:06.663	2026-08-01 08:22:22.96
82d27850-ce58-4da2-8bcd-fe561284b472	00865	HEAD FAQIRIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:06.665	2026-08-01 08:22:22.967
caaf3375-8eab-406d-96e4-b9f0acd86524	02655	HEAD RAJKAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:06.667	2026-08-01 08:22:22.97
9b6fa06b-cd51-41e3-be96-9bd3cb995a9f	00128	HEAD WORKS(BTK)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:06.669	2026-08-01 08:22:22.973
75397071-16fe-4897-9dce-bc8ca8af865b	00844	HERA (CHAK 134	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.671	2026-08-01 08:22:22.975
bd614331-4555-4cbe-9ee3-795810586454	01764	HIJJAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:06.673	2026-08-01 08:22:22.984
bfe8a3ec-c901-4de7-b72e-299676a21869	01751	HILLAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.675	2026-08-01 08:22:22.988
32302ac6-b7ff-401c-8508-0dc5b01d6c96	01337	HINGORJA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.678	2026-08-01 08:22:22.99
06f6389a-3e36-423b-a030-934c3f238b10	00991	HINGORNO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:06.68	2026-08-01 08:22:22.997
370c8e55-2a90-4407-bd52-114a69f69c32	00766	HOLAR (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.682	2026-08-01 08:22:23.004
58a40797-3b37-4ca5-8813-d9c6315974be	00598	HUB CHOWKI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:06.684	2026-08-01 08:22:23.006
7c1b4159-03f7-479c-8cef-d698bc3207e3	01127	HUJRA SHAH MUKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	OKARA	t	2026-07-29 09:18:06.686	2026-08-01 08:22:23.008
3859cb69-0d47-4089-a306-135fc9652fd3	01184	HAJIRA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.584	2026-08-01 08:22:22.175
a64a99f6-2af8-483b-b721-9bad8532f102	00146	HYDER ABAD THAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:06.692	2026-08-01 08:22:23.023
762061d4-239d-4a3e-8204-d4b46740ef21	00475	HYDERABAD	Sindh	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	HYDERABAD	t	2026-07-29 09:18:06.694	2026-08-01 08:22:23.025
58db58a2-5f74-4e67-9f96-b5eada122780	01213	IKHLAS (DIST. A	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.696	2026-08-01 08:22:23.028
6e1d0ba9-aa3f-4eb8-9e59-ec4df4d1d483	01214	INJRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.698	2026-08-01 08:22:23.037
d20ed9a5-7381-41a0-a1f8-92f9f4b8956d	00251	IQBAL NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	CHICHA WATNI	t	2026-07-29 09:18:06.7	2026-08-01 08:22:23.041
6f98f633-f681-4424-9343-b914618da97b	00271	ISLAM GARH(A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.702	2026-08-01 08:22:23.044
f5e0a1d1-3934-4522-a4bc-77342ef307a5	00364	ISLAM PURA JABB	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.704	2026-08-01 08:22:23.054
8d513cbc-d2a8-4869-aedb-f44991c818b6	04021	ISLAMKOT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:06.708	2026-08-01 08:22:23.069
4491887c-6d42-4ae8-b1fe-f771b62c09b4	00907	ISMAILA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.71	2026-08-01 08:22:23.072
cb38a02e-e7bb-41f3-9821-5d47aed19746	00566	J  CAMP	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.713	2026-08-01 08:22:23.077
241aa3d5-54ab-4d24-8813-718581d77d64	00511	JABBI SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.715	2026-08-01 08:22:23.086
ebef2a97-57f8-4564-ae2f-013ce5dc5f23	01324	JACOBABAD	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SUKKUR	t	2026-07-29 09:18:06.717	2026-08-01 08:22:23.09
bdd6ec0d-4c55-4ae7-bfb3-3e0fe081b203	04029	JAFARABAD	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:06.719	2026-08-01 08:22:23.095
dd587956-6cf9-4cb0-bcd8-6835283ff47e	02661	JAFFARABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:06.721	2026-08-01 08:22:23.103
7ff159e8-de03-40eb-8909-0bfe29888b5d	00686	JAHANIA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:06.723	2026-08-01 08:22:23.109
c59a0f5a-3d67-432e-8a71-5aad0c2e1d98	00284	JAISERWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:06.725	2026-08-01 08:22:23.114
146a7565-8a2d-4286-b667-6f5527c3389a	00402	JALAL PUR BHATT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.729	2026-08-01 08:22:23.121
bcaf4f0f-e7b1-4051-a359-ac38f3e76254	00488	JALAL PUR JATTA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	JALAL PUR JATTA	t	2026-07-29 09:18:06.731	2026-08-01 08:22:23.125
0f3d5a49-01a3-4d44-9122-dd64a15af7ce	01380	JALALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TAKHT-E- BHAI	t	2026-07-29 09:18:06.733	2026-08-01 08:22:23.128
432c950b-ef11-45f8-a57d-f713c67805b7	01308	JALALPUR PIRWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHUJABAD	t	2026-07-29 09:18:06.735	2026-08-01 08:22:23.131
f3dc7f44-7e46-4c50-bfb7-646e828e2aac	01148	JALALPUR SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PIND DADAN KHAN	t	2026-07-29 09:18:06.737	2026-08-01 08:22:23.136
7a3f2ee9-9b68-440c-ba2b-ce955144dd06	02647	JALLA ARAIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:06.739	2026-08-01 08:22:23.139
69346717-2b75-466f-9eb9-9ede6e00f521	01706	JAM KE CHATTHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.741	2026-08-01 08:22:23.143
7faee5f4-42a6-4a74-8846-4675ff39d880	02693	JAMAL DIN WALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.743	2026-08-01 08:22:23.147
6e0575f6-2b7f-4c1c-9506-c50c3dfd7dd6	00908	JAMAL GARI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.745	2026-08-01 08:22:23.153
6281b30a-c60b-4b82-9e64-39cdd5d716d3	02643	JAMAL PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:06.747	2026-08-01 08:22:23.156
30910ce6-368d-4b4f-9bcc-4a3ad8d76e6e	00845	JAMAN SHAH(SURS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.749	2026-08-01 08:22:23.16
2e7bd935-b36e-4743-a119-53c6d8598070	00298	JAMPUR	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	DERA GHAZI KHAN	t	2026-07-29 09:18:06.751	2026-08-01 08:22:23.162
1d6f9f83-4213-4b3d-abf2-12b98df144bc	00479	JAMSHORO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:06.753	2026-08-01 08:22:23.165
ddcffc90-40e3-4405-9dda-642a703042e3	01204	JAND	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.755	2026-08-01 08:22:23.169
2cfbed5c-d592-4690-b671-0626b9bdea4a	00365	JAND NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.757	2026-08-01 08:22:23.171
1aa29560-f946-4317-96e7-20e6aaf867cf	01689	JANDO KE GORAIY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.76	2026-08-01 08:22:23.173
fa538e02-8b3f-417f-b91a-4d1a2009b3ed	00499	JARANWALA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	JARANWALA	t	2026-07-29 09:18:06.762	2026-08-01 08:22:23.178
901ad7fd-948b-4bfc-bead-713361491ef1	01009	JARWAR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR MATHELO	t	2026-07-29 09:18:06.764	2026-08-01 08:22:23.182
4bdd9db7-ad3c-4187-8d2e-b391bbfe951e	00567	JASROTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.766	2026-08-01 08:22:23.185
f2ceaa91-a72b-454e-b2e9-3ebd6545297d	00979	JATLAN (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:06.768	2026-08-01 08:22:23.188
1c186c4e-c144-4e1e-9c06-21ee2b4ef321	00366	JATLI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.77	2026-08-01 08:22:23.192
2f5edfd1-e510-4045-98d5-1a48e2234c29	01072	JATOI	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MUZAFFARGARH	t	2026-07-29 09:18:06.772	2026-08-01 08:22:23.201
0f0ca418-a78d-48e8-8b29-83ae31179d77	00501	JAUHRABAD	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	JAUHRABAD	t	2026-07-29 09:18:06.774	2026-08-01 08:22:23.205
5e0365b8-d5f0-48ba-9b90-21a9d2da125e	00854	JAUNPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LIAQATPUR	t	2026-07-29 09:18:06.776	2026-08-01 08:22:23.208
4a2e439f-89ad-4361-ab68-368eeb66fb52	01458	JAURA SAYAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:06.778	2026-08-01 08:22:23.21
7041550a-6a60-4943-8cce-8f79add14a95	00816	JAURAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LALAMUSA	t	2026-07-29 09:18:06.781	2026-08-01 08:22:23.215
cdf37d7f-85d9-4b2c-9f46-8ae6ec2f9e3e	00536	JEHANGIRA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	JEHANGIRA	t	2026-07-29 09:18:06.783	2026-08-01 08:22:23.219
518dfb90-ed72-4fed-8bef-65c4f8eb1b79	00699	JETHA BHUTTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANPUR	t	2026-07-29 09:18:06.785	2026-08-01 08:22:23.221
0f06eb57-79f8-43ae-93ae-146739576701	00947	JHAJRA EAST	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.787	2026-08-01 08:22:23.224
baa38c89-fa30-40d9-9c08-cbc0a5cf74af	00948	JHAJRA WEST	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.789	2026-08-01 08:22:23.227
ae9649b4-aff3-45ed-b30c-690323bf254a	04016	JHAMPEER	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:06.791	2026-08-01 08:22:23.232
fc61c2c5-9685-496d-be21-bda0a461d21b	00332	HUNZA (ALI ABAD	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GILGIT	t	2026-07-29 09:18:06.69	2026-08-01 08:22:23.019
9926d94f-fc27-4f0a-ad4d-f72c9f3215c9	00008	JHANGI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.797	2026-08-01 08:22:23.243
861b72f8-bfb6-46ef-94cb-fdcba4f9a634	01018	JHARIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MULTAN	t	2026-07-29 09:18:06.799	2026-08-01 08:22:23.248
23a89a95-ac10-4fbd-bfc4-060da6202367	01390	JHATLA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:06.801	2026-08-01 08:22:23.251
db7c8e1f-b10e-4037-ae96-f0d88bd6c6be	01339	JHATT PATT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.803	2026-08-01 08:22:23.254
03b6c12d-bc0b-4d1a-be38-12f72c52d368	01741	JHAWARIYA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.805	2026-08-01 08:22:23.259
2a683a87-c9e6-4f73-bd3d-2b9f8d9c01d6	00551	JHELUM	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	JHELUM	t	2026-07-29 09:18:06.807	2026-08-01 08:22:23.262
5b2ca82e-7385-4674-b680-1c2634d5bcf0	01314	JHETEKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:06.809	2026-08-01 08:22:23.266
1fb5397e-b50d-4175-8ca8-971c372f5cd9	00992	JHUDO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:06.814	2026-08-01 08:22:23.273
35999710-c535-4a91-bd23-390d4b3398f6	00009	JHUGIAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.816	2026-08-01 08:22:23.277
4044a426-bd40-4f44-bf5f-32a008bcc9d7	04013	JHULEM ZONE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHULEM	t	2026-07-29 09:18:06.818	2026-08-01 08:22:23.281
ea113e97-882c-4c24-9456-d761f9b4802b	00410	JILLHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.822	2026-08-01 08:22:23.289
f6475863-e849-4cfc-a4ac-9dc3607ac1f4	01760	JILLIANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.824	2026-08-01 08:22:23.291
b99a8213-e985-4e75-b13d-e72387ab74b7	00010	JINNAHABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.826	2026-08-01 08:22:23.295
8f319ac5-03b9-4a58-945d-2221f939bc45	01162	JIWANI	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:06.828	2026-08-01 08:22:23.297
0607d4e8-3531-4ffd-88be-e72776828338	01340	JOHI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.83	2026-08-01 08:22:23.301
2d99ffc9-f0de-48ce-b18e-19e791fb1ac8	00454	JOLIAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:06.832	2026-08-01 08:22:23.304
19a14d53-892d-4f72-94fa-10df5a95a12d	00969	JOR (BUNNER)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:06.834	2026-08-01 08:22:23.308
476d92e0-97c8-43e0-81d6-c201f42052df	00173	JOWAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:06.836	2026-08-01 08:22:23.315
637549d4-3767-4a54-8e5e-23b471a93170	00138	JUMBER KHURD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAI PHERU	t	2026-07-29 09:18:06.838	2026-08-01 08:22:23.319
66e115ba-0f60-4437-961f-a4d1cffc13b2	00767	JUNA (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.84	2026-08-01 08:22:23.321
77c9f95d-d6df-4202-9861-e8b10d583728	01186	JUNDATHI  (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.842	2026-08-01 08:22:23.324
6e5e2e5f-ea29-40fa-8607-71e1d63daccd	00687	JUNGLE MARYALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:06.844	2026-08-01 08:22:23.332
db6a4a2b-47a2-40cf-ac4a-05d157abdebb	00735	K.D.A.	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:06.846	2026-08-01 08:22:23.341
cb0c7259-d015-4b10-b8cd-144c74d14d26	00970	KABAL (SWAT)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:06.848	2026-08-01 08:22:23.357
3ad89d1f-aec8-4d04-8a17-ff10ad1b8292	00688	KABIR WALA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	KHANEWAL	t	2026-07-29 09:18:06.85	2026-08-01 08:22:23.378
7fdc3dab-85dc-42a1-82eb-ce6b70bc32e0	01109	KABUL RIVER	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:06.852	2026-08-01 08:22:23.386
4d064337-dea3-414f-ac42-43ce22911d17	00929	KACHA KHUH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:06.854	2026-08-01 08:22:23.409
11b43957-c65f-4ce1-a6c7-f7dee5c744b8	01754	KACHIWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:06.856	2026-08-01 08:22:23.411
a2d4f8c7-8b97-4729-96eb-e3e90622d93b	00160	KADHALA  (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:06.858	2026-08-01 08:22:23.425
6c92b4d2-d541-4552-9386-56f8ba3d12c4	00076	KADHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	BADIN	t	2026-07-29 09:18:06.86	2026-08-01 08:22:23.457
a22e92ec-a18f-4635-9ab3-d033a8eeb15b	00807	KAHNA NAO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:06.863	2026-08-01 08:22:23.47
35bee3a3-c0fb-4e12-b9b5-0cad682de92e	00102	KAHROR PAKKA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:06.865	2026-08-01 08:22:23.488
8b47ca7b-81fa-4c6b-94fe-428b010ea3d5	01215	KAHUTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.867	2026-08-01 08:22:23.491
48d858ee-f6a5-4763-97d1-8be6342ad9eb	00011	KAKOOL ( PMA)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.869	2026-08-01 08:22:23.493
4fbef38c-92bc-4f84-a1c9-675f7c8f07b1	01761	KAKRA TOWN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.871	2026-08-01 08:22:23.497
b6169f1f-1c45-4fbd-86cc-3d927ebc49d1	00949	KALA BAGH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.873	2026-08-01 08:22:23.501
90ef2034-ee7d-4824-8c40-c1875bc7c483	00012	KALA BAGH (P.A.	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.875	2026-08-01 08:22:23.505
20643460-84e0-4bd6-905b-fc4e5cd51ed4	00568	KALA DEV	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.877	2026-08-01 08:22:23.508
d9efefef-503f-428e-a89e-e309255970ac	00569	KALA GUJRAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.879	2026-08-01 08:22:23.51
b5e47d0c-826a-4de7-867c-6c1667e23b1c	00013	KALA PUL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.881	2026-08-01 08:22:23.514
f7196065-2be4-44cf-880c-45d216f3077c	00808	KALA SHAH KAKU	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	LAHORE	t	2026-07-29 09:18:06.883	2026-08-01 08:22:23.518
bb1df705-1e60-471b-9338-6f00af29066b	01366	KALABAT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:06.885	2026-08-01 08:22:23.521
ae2455c2-618e-48c7-8d45-6cb7de11d0d8	00768	KALAH	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.887	2026-08-01 08:22:23.525
f829380c-5ba9-4ab5-8ed8-d7f5facb4d5d	00214	KALAR KAHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.889	2026-08-01 08:22:23.527
aabb1282-c219-40f5-a100-68531ccabdaf	00161	KALARY MORE(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:06.891	2026-08-01 08:22:23.535
24d91ef1-493f-4834-9b69-c9829c1836f3	01132	KALASWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PASRUR	t	2026-07-29 09:18:06.894	2026-08-01 08:22:23.538
a9d2c94c-6a20-40ba-a9dc-f79e4cf7f7b3	01156	KALAT	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:06.896	2026-08-01 08:22:23.541
84afe212-7ac0-472e-bc69-b7182413159b	00541	JHANG	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	JHANG	t	2026-07-29 09:18:06.795	2026-08-01 08:22:23.242
b9de19ae-6fdf-4c86-baac-826d036163c5	00367	KALIAM AWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.902	2026-08-01 08:22:23.552
44a8c12b-ebd5-4ce0-9609-955174a14578	00368	KALLAR SAYDIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.904	2026-08-01 08:22:23.555
fe12e9a2-62e2-4e0d-931a-d63ebf48802d	00950	KALOR KOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.906	2026-08-01 08:22:23.558
ee06a919-77ba-4548-a5a0-52c224f1d420	00174	KALPANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:06.908	2026-08-01 08:22:23.561
1967b245-5baa-4d36-a074-f2890932e15c	00909	KALU KHAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.911	2026-08-01 08:22:23.564
f98d1cb1-c0bf-4b8e-86ae-868deaef27a9	00252	KAMALIA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	CHICHA WATNI	t	2026-07-29 09:18:06.913	2026-08-01 08:22:23.568
3a1699ae-1d9a-47b9-9085-3b7d7539b469	01762	KAMANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.915	2026-08-01 08:22:23.57
15417f37-21a2-46b6-87d6-1408c3f58e80	00825	KAMBER ALI KHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:06.917	2026-08-01 08:22:23.575
c0f27f73-d845-4962-88b9-b6148c1e8b43	00403	KAMOKI	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	GUJRANWALA	t	2026-07-29 09:18:06.919	2026-08-01 08:22:23.578
af102eed-6ccb-41c3-9aa4-76e66d4efc1e	00051	KAMRA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	ATTOCK	t	2026-07-29 09:18:06.921	2026-08-01 08:22:23.581
b196df63-4fee-438a-8bda-90503ae5281e	00769	KAMROTTY (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.923	2026-08-01 08:22:23.585
e41ff2a1-760d-472f-a1cd-c6ea80a9bc29	00285	KANDAL SAYAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:06.925	2026-08-01 08:22:23.588
e2b3417b-efa5-468a-b352-638546008300	01341	KANDHKOT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.927	2026-08-01 08:22:23.591
711d310d-59f7-463f-857b-34b5bb30e542	00675	KANDIARO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:06.93	2026-08-01 08:22:23.595
622c2f5c-3973-45af-ad3b-8db4158d29dd	00437	KANG CHANAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:06.932	2026-08-01 08:22:23.608
20c7e9e5-e8fd-4c19-b747-78cc38375bab	01137	KANGANPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:06.934	2026-08-01 08:22:23.612
1b0eab21-4646-484c-a3d8-26f90d2313a8	00369	KANGAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.936	2026-08-01 08:22:23.618
aa6ffc4d-fbb8-464c-894e-8f2854f7b19f	00971	KANJU TOWNSHIP	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:06.941	2026-08-01 08:22:23.623
7a82b72d-0bd5-45d8-9dcf-afda4b5b1415	00370	KANOHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.943	2026-08-01 08:22:23.625
eb05ee07-b9d9-4ac3-9660-eeff94a9654d	00371	KANYAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.946	2026-08-01 08:22:23.628
a4862b35-24bb-489f-83d3-8ef8dfce6ca2	00272	KANYAL (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.948	2026-08-01 08:22:23.632
591cb9b3-7aa9-4695-bd97-f6414009b842	01777	KAPOOR WALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.95	2026-08-01 08:22:23.636
53203b5d-cf9e-4901-aef8-f9de2d6daacb	00592	KARACHI	Sindh	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	KARACHI	t	2026-07-29 09:18:06.952	2026-08-01 08:22:23.638
511d3f0b-6933-4ed8-8ff6-653595227f50	02633	KARAM PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:06.954	2026-08-01 08:22:23.641
a6c6dc53-8f8b-4a98-aec6-62ac84a06419	00493	KARIANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:06.956	2026-08-01 08:22:23.644
a9f2ee61-fb93-4c4e-b666-99ac41830cfe	00333	KARIMABAD(HUNZA	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GILGIT	t	2026-07-29 09:18:06.958	2026-08-01 08:22:23.651
d13b76a0-a51d-4274-86f0-9d1180e8c1e6	00666	KARK	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KARK	t	2026-07-29 09:18:06.96	2026-08-01 08:22:23.657
5097f4b5-1ee9-4e54-a3c9-16e9ca9f5dcd	00273	KARKRA TOWN(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.961	2026-08-01 08:22:23.66
d8db4432-b03d-43ef-9d8e-525475a7a4ae	01459	KARMABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:06.963	2026-08-01 08:22:23.665
72d43fcd-256e-45d3-808d-8ca68bc0c6b0	01094	KAROONDI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:06.965	2026-08-01 08:22:23.668
07329d54-0590-40cb-a75a-9d6a9f16df1a	00846	KAROR LAL EASAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:06.967	2026-08-01 08:22:23.671
23e7a3d3-17fd-4207-9f3b-545060cd40ae	01691	KAROR PAKKA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	GUJRANWALA	t	2026-07-29 09:18:06.968	2026-08-01 08:22:23.678
f7937238-5b1a-4c2b-b0bf-4affb8a353ed	00570	KASBA KARYALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:06.97	2026-08-01 08:22:23.683
4523e53f-b535-4fa1-9026-ce4f6838928a	00162	KASHMIR TOBACCO	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:06.972	2026-08-01 08:22:23.686
a1c5af7b-0934-4f53-b233-e42bcfba6755	01031	KASHMIRI BAZAAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:06.974	2026-08-01 08:22:23.69
6da3b042-f6d7-47ba-be3f-b0bb507bc3dd	01232	KASHMOOR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:06.976	2026-08-01 08:22:23.697
b1fc9666-d1b6-436f-985f-175ed9e910c5	00253	KASSOWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHICHA WATNI	t	2026-07-29 09:18:06.978	2026-08-01 08:22:23.703
542f1a62-c83e-49fd-9eb7-9b916c328831	00670	KASUR	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	KASUR	t	2026-07-29 09:18:06.98	2026-08-01 08:22:23.707
b8f13e79-fb78-44a7-9d61-c14c2220afe1	00910	KATLANG	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:06.981	2026-08-01 08:22:23.711
976e2fc5-503f-4512-af23-436c1e42f016	00512	KATTHA SUGHRAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.983	2026-08-01 08:22:23.714
3e44bfe8-eb77-4eb5-b065-49612f187509	00372	KAUNTRILLA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:06.985	2026-08-01 08:22:23.719
2268de7c-39a0-4642-a5cc-2621bc806a83	00014	KEHAL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:06.987	2026-08-01 08:22:23.722
342d5528-dbcc-46dc-88cd-11f0e511757d	00770	KERALA MAJHAN	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.988	2026-08-01 08:22:23.724
edbfa9cc-88eb-4e38-9c34-a35c15844e98	00215	KERYALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.99	2026-08-01 08:22:23.727
01cbfaeb-d140-4adc-b76e-8a79b50a6520	01406	KHAAL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:06.992	2026-08-01 08:22:23.73
bd1a1f24-3d67-4f57-b69a-2e3648612e84	00513	KHABEKI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:06.994	2026-08-01 08:22:23.735
c533bbf1-99fe-45d5-b03b-b38a15440b0d	00771	KHAD GUJRAN(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:06.997	2026-08-01 08:22:23.737
be7e021c-004a-4801-82b8-bdd6db5a5f01	01095	KHADRO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:06.998	2026-08-01 08:22:23.74
faa81d4b-22eb-40b9-9c47-f5d0aa14d0b0	01119	KALHORO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:06.9	2026-08-01 08:22:23.549
a8d81358-6343-4a3e-92d8-8a014f2817cc	00539	KHAIRABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	JEHANGIRA	t	2026-07-29 09:18:07.004	2026-08-01 08:22:23.759
5b50e9b8-ee86-4286-bd7e-e587cb521443	00216	KHAIRPUR	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	CHAKWAL	t	2026-07-29 09:18:07.006	2026-08-01 08:22:23.785
5b728453-5ec8-4c8f-80b5-6e6fc7246d65	00826	KHAIRPUR NATHAN	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	LARKANA	t	2026-07-29 09:18:07.008	2026-08-01 08:22:23.807
3d089161-f608-4a94-97c9-73df9d39025f	00103	KHAIRPUR TAMIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:07.01	2026-08-01 08:22:23.839
98e8e772-e893-488d-9212-880809f62ed7	01460	KHAIW WALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:07.012	2026-08-01 08:22:23.853
f5da4cbd-6e58-42a0-8466-a0d60d1cc3fd	00894	KHAKI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:07.014	2026-08-01 08:22:23.877
133a8cc0-ca24-4e5f-9a4a-0ceef9a737ff	00456	KHALABAT SECTOR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.015	2026-08-01 08:22:23.891
9059aee4-32b8-42b3-84e9-fbfa2f92e2da	00980	KHALIQ ABAD(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:07.017	2026-08-01 08:22:23.92
09a089e1-19a5-46e2-bde9-ee60583e0792	00514	KHALIQABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.019	2026-08-01 08:22:23.943
2bd0bdb2-2167-417f-8205-21204950ddef	00571	KHAMBE KHANPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.021	2026-08-01 08:22:23.946
f1f66926-665a-4221-839a-5562bd2aef22	00855	KHAN BELA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LIAQATPUR	t	2026-07-29 09:18:07.023	2026-08-01 08:22:23.97
32b3f414-553d-4bf5-a10f-66517fa75ace	01290	KHAN GAH DOGRAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.025	2026-08-01 08:22:23.994
9a33e70f-c8c2-4029-8e08-b4dd3012cbf7	01306	KHAN KA SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHIKHUPURA	t	2026-07-29 09:18:07.027	2026-08-01 08:22:24.011
c2d7adef-705b-477c-afa4-48a23c0e5f52	01268	KHAN M. WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.029	2026-08-01 08:22:24.018
f47e004b-44f2-456c-8b51-441e3dfc2694	00697	KHAN PUR	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	KHANPUR	t	2026-07-29 09:18:07.031	2026-08-01 08:22:24.037
c57eebc0-0771-4004-a411-ac2198ec13a0	01342	KHAN PUR DISTT.	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.033	2026-08-01 08:22:24.056
165f23b3-a84e-47fb-931c-108ab099fc3b	02608	KHAN WHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:07.037	2026-08-01 08:22:24.105
1b6f6dbf-27a5-4793-874c-f223bb38e6c9	00274	KHANABAD (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:07.038	2026-08-01 08:22:24.122
e05e9050-465f-4bc5-b301-4f06e5fa5da7	00683	KHANEWAL	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	KHANEWAL	t	2026-07-29 09:18:07.04	2026-08-01 08:22:24.143
4220a22c-f486-4559-a529-e34f4d8390ea	01073	KHANGARH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.042	2026-08-01 08:22:24.169
496818ce-442e-4f89-a838-51fe8d89c359	00217	KHANPUR	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	CHAKWAL	t	2026-07-29 09:18:07.044	2026-08-01 08:22:24.208
4b7d6a1b-fe66-4fef-b7e8-cdbc6c7c0105	02602	KHANPUR (SINDHI)	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:07.046	2026-08-01 08:22:24.218
b77e91ab-eaa9-4df3-9d9e-7bf13baf0d2b	01010	KHANPUR MEHER	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR MATHELO	t	2026-07-29 09:18:07.048	2026-08-01 08:22:24.233
b885d88d-0713-4187-b1f2-f9602881f530	01074	KHANPUR SHOMALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.05	2026-08-01 08:22:24.24
d683ba0a-5823-4926-a1b4-0b161739ecd1	01407	KHAR (BAJORE AG	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:07.051	2026-08-01 08:22:24.242
15850e1c-6ded-4b56-ad57-451f769a91f7	00129	KHAR (BATKHELA)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:07.053	2026-08-01 08:22:24.245
353f22e9-e7ac-44f0-b973-e46acc04b702	00572	KHARALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.055	2026-08-01 08:22:24.253
f88d5d91-841c-4a61-80a7-6ecc02036a48	01163	KHARAN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.057	2026-08-01 08:22:24.257
00e592ca-a4c0-4a53-9363-8804490575d8	00702	KHARIAN	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	KHARIAN	t	2026-07-29 09:18:07.059	2026-08-01 08:22:24.259
b8a28f29-431c-4dc4-9770-b70d487949e5	01291	KHARIAN WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.061	2026-08-01 08:22:24.268
151d1d4f-39b6-48b3-bad2-7a9c2e8b1820	01188	KHARICK	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.063	2026-08-01 08:22:24.27
a472537e-ca46-4a72-9517-47d004bc4766	01315	KHAROTA SAYEDAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.065	2026-08-01 08:22:24.272
10c099f5-2a11-41ad-99ac-3bb99af47440	01110	KHAT KALI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:07.066	2026-08-01 08:22:24.275
c7cacb2d-8f20-4abd-aa81-bff5e5a27b6b	00163	KHAWAJA TEXTILE	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:07.068	2026-08-01 08:22:24.286
c15b5c53-af60-4f20-ac9e-5f244a8fe8d6	00722	KHEWRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHEWRA	t	2026-07-29 09:18:07.072	2026-08-01 08:22:24.292
9eda8d4d-5061-4f20-bc80-a4549d9f0b05	01251	KHIDAR WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.074	2026-08-01 08:22:24.295
13308c32-e883-4a6c-a6ae-4eff17271c3c	00993	KHIPRO	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	MIRPUR KHAS	t	2026-07-29 09:18:07.076	2026-08-01 08:22:24.303
23f4f559-e343-4eb8-993c-032ce312b465	00573	KHOHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.078	2026-08-01 08:22:24.306
b3d996ce-627b-4cb2-8c8b-9b84da9dab6f	01788	KHOJA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.08	2026-08-01 08:22:24.309
69c1ea6c-23f5-4bb9-832c-5b278fa1e274	00052	KHORA KHEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.082	2026-08-01 08:22:24.311
ad5a6964-8962-4f0a-9cc3-1d083e057aa5	01216	KHORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.083	2026-08-01 08:22:24.324
a3d7e00e-298b-4029-93ef-420edc11458a	00515	KHORRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.085	2026-08-01 08:22:24.352
7c10bd85-8840-420e-bb73-2be304ea8116	00077	KHOSKI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	BADIN	t	2026-07-29 09:18:07.087	2026-08-01 08:22:24.373
07bea5cb-122a-4d9e-9ed7-db06bb2d53fb	01367	KHOTA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:07.089	2026-08-01 08:22:24.393
0402ffd4-db1c-443a-8f0b-59d26c407710	00671	KHUDIAN KHAS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KASUR	t	2026-07-29 09:18:07.091	2026-08-01 08:22:24.401
9367cf1a-2e0a-483d-ab24-792bc08b0075	01217	KHUNDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.093	2026-08-01 08:22:24.406
16f5baf1-c42d-4fe5-9f0d-adc582b70ce5	01343	KHURA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.095	2026-08-01 08:22:24.41
aa010ec1-d89c-42f2-9409-ff531b0803cc	00673	KHAIR PUR MEERU	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	KHAIR PUR MEERU	t	2026-07-29 09:18:07.002	2026-08-01 08:22:23.756
f8088c93-2187-47c1-ae75-50b2ddc412ca	00516	KHUSHAB	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	JAUHRABAD	t	2026-07-29 09:18:07.1	2026-08-01 08:22:24.425
251ec2ce-711f-4503-bba4-d0a3d8c62e5c	01152	KHUZDAR	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.102	2026-08-01 08:22:24.433
6e66c8ae-ca90-4dd1-a513-0d80248e16b3	00480	KHYBER	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:07.104	2026-08-01 08:22:24.439
13020e9b-b846-4942-9969-64d9ca63740c	02610	KINGRI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:07.106	2026-08-01 08:22:24.442
6d6c53bc-1df2-42a1-8281-4eb72a8c2281	00094	KITCHI WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:07.107	2026-08-01 08:22:24.452
a63d8e3c-9344-45e3-9c0f-7f99b5dfcf1e	00411	KLASKE MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.11	2026-08-01 08:22:24.455
a016ed53-12fd-481b-b3af-867ba812a987	01032	KOHALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.112	2026-08-01 08:22:24.458
3d98c750-074e-4a7b-b32e-3c00dafc1ac7	00724	KOHAT	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	KOHAT	t	2026-07-29 09:18:07.114	2026-08-01 08:22:24.463
65e248ca-04b4-4658-8b89-8dc4f30da623	04110	KOHISTAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOHISTAN	t	2026-07-29 09:18:07.119	2026-08-01 08:22:24.477
d7a8b1f8-0d71-4f12-b2ad-d6fb317bb62b	01189	KOHKOT (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.121	2026-08-01 08:22:24.486
4fb46b69-551d-4c9e-87f5-37e714815859	01344	KOHLU	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.122	2026-08-01 08:22:24.489
25118915-ff19-41f2-9fbd-c3cd7d142150	01059	KOHRI (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.124	2026-08-01 08:22:24.493
8b21b165-fc33-4b13-ab0d-588995395afe	00809	KOT ABDUL MALIK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:07.126	2026-08-01 08:22:24.5
b9a357a1-dc3d-49c8-8533-d744ccb28dfe	01787	KOT ABDULA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:07.129	2026-08-01 08:22:24.504
e4312abd-6e1b-4e75-8d7c-ad975e2163d7	00747	KOT ADDU	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	KOT ADDU	t	2026-07-29 09:18:07.13	2026-08-01 08:22:24.508
7565f030-9c5c-4038-8d15-eb356ac8c76e	00546	KOT BAHADAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:07.132	2026-08-01 08:22:24.522
c2f5c362-c7d6-4402-a075-154148978eba	01345	KOT BANGLOW	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.134	2026-08-01 08:22:24.535
d07cdef9-ebcd-43a3-ab15-74154f1b52fd	00951	KOT CHANDNAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.136	2026-08-01 08:22:24.537
9c0ef6b3-f5f0-471a-8b7c-dfbeec90625b	00299	KOT CHUTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.138	2026-08-01 08:22:24.54
51ddca10-6126-46b5-bf00-78a251f2349a	01346	KOT DEJI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.14	2026-08-01 08:22:24.543
924bdd36-2dff-488d-89f1-1f291ec5dd89	00676	KOT DIGEE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:07.141	2026-08-01 08:22:24.548
5df55a0e-ca97-4563-a1ff-a05efbe665dd	01218	KOT FATEH KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.143	2026-08-01 08:22:24.552
0e0f2dc3-3557-40e6-a0ec-86be3328035b	00994	KOT GHULAM MOHD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:07.145	2026-08-01 08:22:24.556
886ae4e8-774f-42fe-9158-3b96171f2ea0	01461	KOT INAYAT KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:07.147	2026-08-01 08:22:24.569
5fd9ee72-d6d4-4518-9a65-4092c1393ee6	00930	KOT ISLAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.149	2026-08-01 08:22:24.572
7ff0d3ac-012a-4e27-a134-d209023fc436	00309	KOT JAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.151	2026-08-01 08:22:24.575
3126af1b-be69-4ea4-a563-af6374f63572	00164	KOT JAMEL (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:07.153	2026-08-01 08:22:24.583
cbcb67b0-046b-455e-b7f7-b80448247351	00412	KOT JE SING	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.154	2026-08-01 08:22:24.586
bc3d19c1-5bd7-4a25-9edf-048ae9287ef9	00413	KOT LADHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.156	2026-08-01 08:22:24.589
b602f713-52d1-421d-9ed6-29533b89b753	00300	KOT MITHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.158	2026-08-01 08:22:24.601
22324519-034f-46bd-b7c4-97963ce6c9d0	01269	KOT MOMIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.16	2026-08-01 08:22:24.606
c5314904-7d19-4be4-be28-1ca00eb46cc3	01692	KOT NAINAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.162	2026-08-01 08:22:24.61
d7db9014-074a-4792-9374-dbebf1a5a07d	00458	KOT NAJEEB ULLA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.164	2026-08-01 08:22:24.62
183699a7-7da0-433f-ad1a-310aa59713b2	02657	KOT QAISRANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.166	2026-08-01 08:22:24.624
0f028058-6626-4054-855a-a64b69a90c50	02640	KOT QAISRRANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.168	2026-08-01 08:22:24.627
99cc57a8-b93e-4f02-a376-8b68344ae66e	01172	KOT RADHA KISHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAIWIND	t	2026-07-29 09:18:07.169	2026-08-01 08:22:24.635
1f037c39-4747-4648-adfe-8caa8adc9571	01711	KOT RANJEET	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.171	2026-08-01 08:22:24.638
c39016f5-f20b-42f1-9eb0-68877e7cd02c	02685	KOT SABZAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:07.173	2026-08-01 08:22:24.641
27caed88-4572-46b4-9f58-f4b533f044ec	00700	KOT SAMAYA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANPUR	t	2026-07-29 09:18:07.175	2026-08-01 08:22:24.649
03973b5d-3146-4162-bac8-bbf31e2140b7	01391	KOT SARANG	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:07.177	2026-08-01 08:22:24.651
3cf2b27e-eed0-40f0-b4e2-1fdad216bdbe	00931	KOT SUJAN SING	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.179	2026-08-01 08:22:24.654
9eb42fa8-5c89-4bbe-a63b-9f46d2de75c0	00847	KOT SULTAN(BHAI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:07.181	2026-08-01 08:22:24.657
2e85edcc-b70d-4560-9b7c-540f12b94da3	00130	KOTA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:07.183	2026-08-01 08:22:24.66
7b86c990-2b46-46ac-988a-8968e67b5b3d	00015	KOTHIALA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.185	2026-08-01 08:22:24.669
9103d8db-a9cd-476f-b913-4c14db33b040	00438	KOTLA ARAB ALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.186	2026-08-01 08:22:24.672
6001b76f-0bb0-4a10-a7e5-02f039c894bc	00147	KOTLA JAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:07.188	2026-08-01 08:22:24.675
e0cb692e-2dc1-4010-8ced-9831f2ac3b97	02650	KOTLA MUSA KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:07.19	2026-08-01 08:22:24.677
e87e65e7-2647-451c-ac34-da89fc7be5e7	00323	KHURRIANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	FAISALABAD	t	2026-07-29 09:18:07.098	2026-08-01 08:22:24.422
12025a7d-baad-4248-907f-d356b5b981b0	00494	KOTLI KOHALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:07.196	2026-08-01 08:22:24.692
91f85b4f-31b5-43ed-bc1c-4a0ac6a59db4	01316	KOTLI LOHARAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.198	2026-08-01 08:22:24.7
fc2c58d4-ba82-4f3e-adda-f66a8bb4c3c6	01033	KOTLI SATTIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.2	2026-08-01 08:22:24.703
b07a7fa2-1756-4ab1-bd09-dbac1eeaab76	00481	KOTRI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:07.202	2026-08-01 08:22:24.706
53f6cbf3-74c3-4928-b8e1-5221d98bc3be	01347	KOTRI KABIR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.204	2026-08-01 08:22:24.71
3432de6d-0b51-4618-88a1-22a97306e60a	00414	KOULO TARRAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.205	2026-08-01 08:22:24.717
b6a51f9a-6edb-4112-bb10-386cf3e3cc8a	01164	KUCHLAK	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.207	2026-08-01 08:22:24.721
35f5f1b6-1c71-407a-8a89-8290dce458c9	00517	KUFRI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.209	2026-08-01 08:22:24.723
dc50210d-7538-4ae5-b3ba-67e355d2d048	01034	KULDANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.213	2026-08-01 08:22:24.733
58b3a3c1-d9fc-494d-8e7c-fc2ce223d77f	04017	KUMB	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:07.215	2026-08-01 08:22:24.737
9e1a17b5-888b-4f77-aa34-8fc3e66be755	01408	KUMBAR  BAZAAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:07.216	2026-08-01 08:22:24.74
3a58b05b-1f1f-48f7-88dd-102c74b0a66d	00677	KUMBH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:07.218	2026-08-01 08:22:24.743
ea89223b-af36-41e5-8f22-40a94555e0e0	01368	KUNDA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:07.22	2026-08-01 08:22:24.751
ff054b37-a38e-43ad-8448-bd7e1e8966cf	00952	KUNDIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.222	2026-08-01 08:22:24.754
aefec1d5-e5af-490c-9225-f1c1bdff069c	00439	KUNJAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.223	2026-08-01 08:22:24.757
ca0c5bb5-5a73-456f-a80f-09dbcd4fb63e	00995	KUNRI	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	MIRPUR KHAS	t	2026-07-29 09:18:07.226	2026-08-01 08:22:24.76
b57842b1-0659-47a7-8f26-29783c015848	00866	KUTHIALA SHEIKH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.228	2026-08-01 08:22:24.767
685cb827-8c1c-4677-ae90-48b4bc8f8335	00867	KUTHIALA SYEDAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.23	2026-08-01 08:22:24.77
3807ac41-08d9-4d58-afa9-0697630ab94d	01447	LAB MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAH CANTT.	t	2026-07-29 09:18:07.232	2026-08-01 08:22:24.774
dcaa9d56-7cf0-4609-b3dc-cffdc3a6b05b	00738	LACHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:07.234	2026-08-01 08:22:24.777
40d79324-03e5-4b37-acf4-7543d387511a	01775	LADHA WAL WARACH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.235	2026-08-01 08:22:24.784
feb4902d-a70a-4051-8d78-97d874f29d8a	00848	LADHANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:07.237	2026-08-01 08:22:24.787
397b02c8-8093-4d2b-9915-177a2221f957	00789	LAHORE	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	LAHORE	t	2026-07-29 09:18:07.239	2026-08-01 08:22:24.79
cb2d8d55-a6e2-4353-ab00-4215ce3618e2	00868	LAIDHER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.241	2026-08-01 08:22:24.793
eddec32d-76a4-4c98-80d2-3c354dd69721	01219	LAKAR MAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.243	2026-08-01 08:22:24.8
afd216b1-825a-433e-b1ef-e61ea4280df7	00495	LAKHANWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:07.246	2026-08-01 08:22:24.803
c371ab45-fba1-456e-877a-1bfc329fa188	01349	LAKHI GHULAM SH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.247	2026-08-01 08:22:24.805
314c116c-3cf6-4d9f-8d9b-4ab0b981509c	00113	LAKKI MARWAT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:07.249	2026-08-01 08:22:24.808
c2e77963-c655-44e0-abde-63ab5b0cb808	02651	LAL SOHARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:07.251	2026-08-01 08:22:24.811
e59584e5-c639-496a-a0f0-9c3c7f34e86c	00849	LALA ZAR(CHAK 1	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:07.253	2026-08-01 08:22:24.818
eaa07070-45fc-45e2-b88e-d8dc7527737f	00812	LALAMUSA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	LALAMUSA	t	2026-07-29 09:18:07.254	2026-08-01 08:22:24.82
c6ce5d2f-2cfe-4cae-a5e6-a8c1f7775e5b	01270	LALLIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.256	2026-08-01 08:22:24.823
6e179a7a-217d-46f6-8f23-7c2948b0967d	01075	LALPIR  (THERMA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.258	2026-08-01 08:22:24.826
79c5933f-0642-41c5-ae07-6bb06806e53d	00827	LALU RAWANK	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:07.261	2026-08-01 08:22:24.831
12bf166e-b87e-4e02-9476-2281c9bbc9bc	01769	LALYANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.263	2026-08-01 08:22:24.835
26644a22-5076-4394-a8d4-1afb93591920	00440	LANGRIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.265	2026-08-01 08:22:24.838
e9f3ed06-8c4b-4475-accd-6630ec3bc04a	00311	LAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.267	2026-08-01 08:22:24.84
410ca982-4eb7-4be4-bda4-138bdc0dd847	00218	LARI PATHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.268	2026-08-01 08:22:24.843
0f3f09f0-c6ae-443e-8642-279a6f3c54be	00817	LARKANA	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	LARKANA	t	2026-07-29 09:18:07.27	2026-08-01 08:22:24.85
71efa656-a7fe-4869-87e6-8981ec3a000b	00628	LASBELA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:07.272	2026-08-01 08:22:24.852
8d852f28-4ab7-414e-a578-e9d36085b999	00114	LATAMBER	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:07.274	2026-08-01 08:22:24.854
f0fc18c2-5554-4468-8e1b-f57f31e5a13f	01392	LAWA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:07.276	2026-08-01 08:22:24.858
860eda21-b950-4979-9265-24a8f5bba8da	01035	LAWRENCE COLLEG	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.278	2026-08-01 08:22:24.861
321c56b9-070e-45c7-bfd4-ed9c5a717e8d	00053	LAWRENCEPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.28	2026-08-01 08:22:24.866
a68d311d-422a-4e1d-aa3b-2c5d98c75de4	00839	LAYYAH	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	LAYYAH	t	2026-07-29 09:18:07.282	2026-08-01 08:22:24.869
0755f941-e9b3-4d0b-9d06-dff699f53d8b	01350	LEHRI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.284	2026-08-01 08:22:24.874
55e3a653-c0d0-4949-874b-28c66002b143	00165	LIAQATABAD(A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:07.286	2026-08-01 08:22:24.876
f389bda6-d197-4f78-ab3c-e1f6618fa0fb	00856	LIAQATPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LIAQATPUR	t	2026-07-29 09:18:07.289	2026-08-01 08:22:24.887
04ea171b-49b1-4b57-bbbc-2d031efe056f	01693	KOTLI BEHRAAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.194	2026-08-01 08:22:24.689
11a87d3e-cf8d-4c95-891a-cf35576d4a86	01381	LOND KHAWAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TAKHT-E- BHAI	t	2026-07-29 09:18:07.296	2026-08-01 08:22:24.897
92f9b742-3c80-460b-bf60-d0af66174370	00689	LOOTHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:07.298	2026-08-01 08:22:24.904
e52b8a1a-0c9a-458b-a541-6063644db925	01157	LORALAI	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.3	2026-08-01 08:22:24.907
f28e0653-99c6-404c-a99e-b1f2f470853e	01036	LOWER TOPA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.301	2026-08-01 08:22:24.909
29559392-87fe-4b78-8d93-05bb8ddebc24	00312	LUCKY CEMENT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.303	2026-08-01 08:22:24.915
788f7e08-0310-47b9-8fac-8fbba2f2167f	01439	LUDDAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:07.305	2026-08-01 08:22:24.917
92d91371-5846-4f68-9272-2d6a3d68cf90	01165	MACH	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.307	2026-08-01 08:22:24.92
d0bf41da-1e70-42c6-9af8-bb3d55e40fc2	01292	MACHIKEY(FACTOR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.309	2026-08-01 08:22:24.923
8ae382cf-04ce-4ea3-a9f8-f1455732f270	01440	MACHIWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:07.311	2026-08-01 08:22:24.926
bc6e77d2-4b7d-488c-ad21-c5a5056d7f08	01351	MADEJI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.313	2026-08-01 08:22:24.934
791dc76d-7325-4af7-97f5-f1d478ffa8f7	00973	MADIAN (SWAT)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:07.315	2026-08-01 08:22:24.937
ff3de2a6-da50-437d-9b9e-df09f748fe39	01060	MADINA MARKET	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.317	2026-08-01 08:22:24.94
cec0c82e-3e30-4da1-92a8-56fd3f403253	00219	MAGHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.318	2026-08-01 08:22:24.944
d55d4315-015f-44fc-be18-d505a58afebc	02668	MAHI SIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:07.32	2026-08-01 08:22:24.95
63bba0b1-0786-40c2-b90e-b5e6e184f44d	02680	MAIANWALI QURESHIYAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAHIM YAR KHAN	t	2026-07-29 09:18:07.322	2026-08-01 08:22:24.953
6e50d691-ca7c-44fc-9627-8c83e7cc4b6e	01441	MAILSI	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	VEHARI	t	2026-07-29 09:18:07.324	2026-08-01 08:22:24.957
1df951b0-f778-420e-b499-5047daf3384b	00220	MAINGON	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.326	2026-08-01 08:22:24.966
95ca0465-6656-4eda-853e-037f645ab5f8	01086	MAINGRI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:07.328	2026-08-01 08:22:24.968
4d24f762-011c-4b09-8b37-4149c204139b	00574	MAIRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.33	2026-08-01 08:22:24.971
2b855419-0d06-4bab-bd45-eb6b57249619	01220	MAIRA MATOOR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.332	2026-08-01 08:22:24.974
e6022552-5a6e-476d-b115-e2ca1d33df75	00690	MAITLA CHOWK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:07.333	2026-08-01 08:22:24.977
64bb785c-eaef-4403-8321-2385537ba54b	01694	MAJO CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.335	2026-08-01 08:22:24.983
9a9785ca-02ec-49aa-99a4-82a69912bae9	01744	MAKARWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.339	2026-08-01 08:22:24.989
4073cc2f-9b89-4b93-bae3-082bc1d23682	01221	MAKHAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.341	2026-08-01 08:22:24.993
a7052205-6df6-4e2e-8b1f-f4148dada3bc	00459	MAKHAN COLONY	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.343	2026-08-01 08:22:24.999
a0652ebb-4582-47d5-8385-749a9c990ef3	01421	MAKLI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	THATTA	t	2026-07-29 09:18:07.345	2026-08-01 08:22:25.002
13cf7e80-1c41-4fe6-abed-daf2d3c828c0	02631	MAKLOD GUJN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:07.347	2026-08-01 08:22:25.004
3381afe6-da7f-4726-b921-aee6526b8535	00131	MALAKAND	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:07.349	2026-08-01 08:22:25.008
f196b1b1-8025-4afc-872d-ee773eb727f8	02521	MALAKWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:07.35	2026-08-01 08:22:25.01
7a57fec6-cd0b-404f-a7d0-8ae1775ec6b1	00054	MALAN MANSOOR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.352	2026-08-01 08:22:25.019
ba0e5e89-0611-4a0e-a22f-733b8459abd9	00547	MALHOONA MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:07.354	2026-08-01 08:22:25.022
fe555deb-fb7b-487b-8e8d-b41b1fc2d1c7	00441	MALHUKHOKHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.356	2026-08-01 08:22:25.025
9b8c8ce2-a508-4b83-b4c5-785ac26bf5b1	00055	MALIK MALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.358	2026-08-01 08:22:25.03
842169e2-d791-4a08-9deb-d51279b7d314	00016	MALIK PURA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.36	2026-08-01 08:22:25.033
db054876-7eef-4d24-8cd9-7dcd521b7ac3	00869	MALIKWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.362	2026-08-01 08:22:25.035
817bed14-834e-4d4d-ad72-e6bef8c3d929	00460	MALIKYAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.364	2026-08-01 08:22:25.039
f8638336-fbf6-4cec-ae1e-81f870bcfed3	00496	MALOWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:07.366	2026-08-01 08:22:25.041
4d3d908e-0d90-4431-a990-238ea4b43090	04111	MAMAND AGENCY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MAMAND AGENCY	t	2026-07-29 09:18:07.367	2026-08-01 08:22:25.044
bbc40c1d-487c-448d-a6f1-b069678c361b	01252	MAMON KANJAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.369	2026-08-01 08:22:25.05
37bcd195-0447-4109-a393-75cdd4c7ab37	00301	MANA HAMDANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.371	2026-08-01 08:22:25.054
34eb1c35-85e2-453b-9662-9ec8dcb18d71	01293	MANAWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.373	2026-08-01 08:22:25.058
80580be9-91ab-4f15-ab96-6c417390730d	00632	MAND	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:07.374	2026-08-01 08:22:25.067
efe2ac02-8993-4d48-9aa4-56e1a76c36a7	01695	MANDHIR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.377	2026-08-01 08:22:25.069
6126961c-89de-427e-837d-71cf4ed479dc	02616	MANDI AHMAD ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.379	2026-08-01 08:22:25.072
bab3f4b7-82f7-49d6-9067-7f6d9029f73c	00858	MANDI BAHAUDDIN	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.381	2026-08-01 08:22:25.074
5ac48ec4-703b-4e93-8ddd-c7df5e1e30bc	01294	MANDI DHABA SIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.382	2026-08-01 08:22:25.077
53d98b5a-1fbe-4a93-9f8e-a8e9a96cf3f2	02615	MANDI FAIZ ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.384	2026-08-01 08:22:25.083
087c88aa-283e-41d9-8ee3-9a31f55ef38d	01295	MANDI FAIZABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.386	2026-08-01 08:22:25.085
36998ce9-8a9a-4111-a2c5-9224883815e1	00104	LODHRAN	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BAHAWALPUR	t	2026-07-29 09:18:07.294	2026-08-01 08:22:24.891
2cd382f1-e035-44ad-9512-c9dceeaa936f	01296	MANDI SAFDAR AB	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.392	2026-08-01 08:22:25.094
43cb870e-46a8-46de-8c60-26f62bf4a1bc	00548	MANDI SHAH JUIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:07.394	2026-08-01 08:22:25.103
93b8aade-1bda-4b23-836b-c8e8f15b4e3e	01297	MANDI SUKHAKI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.396	2026-08-01 08:22:25.119
2ccd6634-bbda-469d-b91c-9c16d75c155c	00672	MANDI USMANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KASUR	t	2026-07-29 09:18:07.398	2026-08-01 08:22:25.123
7f1574fe-2f01-4672-9883-0d02bbd538b5	00017	MANDIAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.399	2026-08-01 08:22:25.125
030ada5c-6bd5-40ba-bd19-05be78c8c430	00373	MANDRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.401	2026-08-01 08:22:25.127
d2474b1c-8124-4168-82f7-9156b9a6201c	00286	MANDRANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:07.403	2026-08-01 08:22:25.132
ea9151db-235f-4ef0-8a71-86f0b8d25b3e	00739	MANDURI KURRAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:07.405	2026-08-01 08:22:25.135
872b7632-3a0d-4503-92a5-3c69c4026ed3	00981	MANGA HAMLET (A	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:07.407	2026-08-01 08:22:25.139
aeeb36d4-147e-42f5-80ac-4c3a4049f199	00135	MANGA MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANGA MANDI	t	2026-07-29 09:18:07.408	2026-08-01 08:22:25.142
399a08f3-e392-4ba3-9fdc-df8e399f565f	00870	MANGAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.41	2026-08-01 08:22:25.149
bdb7454d-e8cc-4f57-b306-22742aadb259	00575	MANGLA CANTT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.413	2026-08-01 08:22:25.152
79f5c640-e89c-4a3c-b701-c8454b8548d7	00982	MANGLA DAM	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:07.414	2026-08-01 08:22:25.154
a9f91f1f-0374-4169-8ed9-b1d15dd8c165	00983	MANGLA INDUSTRI	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:07.416	2026-08-01 08:22:25.157
6a8891ef-4cce-4a0f-bf50-bc6d3548340c	00714	MANGLIA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.418	2026-08-01 08:22:25.165
77977fa8-b4e5-4be0-9e73-d9ee8e8d3bf5	00442	MANGOWAL GHARBI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.42	2026-08-01 08:22:25.168
988d7ef4-5e5d-49a7-ad7d-b93b4e89962d	00148	MANKERA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:07.422	2026-08-01 08:22:25.171
28b8a360-5d6a-42c4-b46c-03e245f357be	01369	MANKI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:07.424	2026-08-01 08:22:25.175
50193246-f40a-4636-8df6-79476f12e052	00871	MANO CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.428	2026-08-01 08:22:25.186
4f6d77a0-f28f-465d-b9c1-e34621acc434	00880	MANSEHRA	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MANSEHRA	t	2026-07-29 09:18:07.43	2026-08-01 08:22:25.188
98f92530-b05e-4601-93e6-c5e43a075e8f	00056	MANSHERA CAMP	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.432	2026-08-01 08:22:25.19
483cb5b2-d71e-4fea-8811-93837cb38cbc	00018	MARA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.433	2026-08-01 08:22:25.193
f411a7e6-c48a-4d80-abb3-1aaf50bf4ec4	00375	MARA SHAMAS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.435	2026-08-01 08:22:25.2
4ae6fd19-2f2e-436d-a0a1-bab021392f5f	01696	MARALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.437	2026-08-01 08:22:25.202
06a2e8f6-bc73-4995-9558-afbc86d8a19b	00900	MARDAN	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MARDAN	t	2026-07-29 09:18:07.439	2026-08-01 08:22:25.205
9ea476a1-d30d-46f2-a448-e641901eb447	00518	MARDWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.441	2026-08-01 08:22:25.208
2f7efacd-3f61-4116-aee8-eb81e8e04b4a	01370	MARGAZ	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:07.443	2026-08-01 08:22:25.211
c80f5cd9-3742-40b4-85fa-b4c76fee099c	00057	MARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.445	2026-08-01 08:22:25.217
b2b6ee98-6047-4f6d-9e72-0b206f6b0deb	00954	MARI INDUS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.447	2026-08-01 08:22:25.219
8918fc7c-1a05-4d2a-b8ba-d476c910a935	01166	MASHKAY	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.449	2026-08-01 08:22:25.222
dbf6e3d7-564b-4b72-ac75-4f2b7d6cb92b	01158	MASTUNG	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.451	2026-08-01 08:22:25.225
6013acd1-6745-4ae6-9dc7-c6146ee7c808	01222	MATHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.452	2026-08-01 08:22:25.227
3bb6c8cc-3ec4-4e47-b83a-821f50308660	00482	MATIYARI	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	HYDERABAD	t	2026-07-29 09:18:07.454	2026-08-01 08:22:25.234
304045f5-5044-4eb4-915c-234e1b0a6998	00078	MATLI	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	BADIN	t	2026-07-29 09:18:07.456	2026-08-01 08:22:25.236
5cbb19aa-1ad6-4943-ada4-c88f1ee31e94	00974	MATTA (SWAT)	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:07.458	2026-08-01 08:22:25.24
14df0a06-28b5-4404-9799-312f7209edad	00911	MAYAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:07.46	2026-08-01 08:22:25.243
f527e1e9-2ea7-4703-a0dd-8eead97470da	00339	MCB 279 J.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:07.463	2026-08-01 08:22:25.249
2a355fdd-0db0-4360-8192-9cc74fa8a87d	01253	MCB TORIAN WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.464	2026-08-01 08:22:25.252
ca29bc55-66ff-441f-bc18-c5ad191d67b7	00828	MEHAR	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	LARKANA	t	2026-07-29 09:18:07.466	2026-08-01 08:22:25.256
8806a1a8-7c8c-49ad-bbff-a5adb053fc31	01076	MEHMOODKOT	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MUZAFFARGARH	t	2026-07-29 09:18:07.468	2026-08-01 08:22:25.258
453eabf5-6811-47b0-8222-f9c92da5de85	01697	MEHRAB PUR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	GUJRANWALA	t	2026-07-29 09:18:07.47	2026-08-01 08:22:25.26
2378b06f-0df1-4f36-8859-dc43f969b043	00678	MEHRABPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:07.471	2026-08-01 08:22:25.267
ad4896bb-1705-44b5-ba43-086b3dc2764b	00443	MEHSAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.473	2026-08-01 08:22:25.269
db296e1c-47d4-4c4d-80a5-17bd949ec555	00634	MENAZ	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:07.475	2026-08-01 08:22:25.272
8ed79b2c-1d83-467a-8f8b-432c9103e416	00923	MIAN CHANNU	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MIAN CHANNU	t	2026-07-29 09:18:07.477	2026-08-01 08:22:25.292
320b1a9d-4dc9-4c9f-bd4b-9f7572a2fd08	00166	MIAN M.SUGAR MI	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:07.48	2026-08-01 08:22:25.297
bff6cb63-5ac6-4ad3-9b52-9eeb40b7d929	00221	MIANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.481	2026-08-01 08:22:25.3
94fec809-97a4-4804-bb6e-e4b690a6fcd2	00939	MIANWALI	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	MIANWALI	t	2026-07-29 09:18:07.483	2026-08-01 08:22:25.303
bed9b88b-c5b3-4afe-81f8-1fab2317f8f9	00095	MANDI SADIQ GUN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:07.39	2026-08-01 08:22:25.09
95804699-6d0e-498e-b210-7fa76cee4e1e	01190	MINI INDUST. ES	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.489	2026-08-01 08:22:25.318
557d0627-dcb6-4c2e-9fc4-0922535539e4	00115	MIR ALI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:07.49	2026-08-01 08:22:25.322
fe0abbdb-bfc0-4056-824f-ffae84bbf6fd	00749	MIR PUR BAGHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:07.493	2026-08-01 08:22:25.327
e76e2444-1c3c-46ba-8ddd-0c416ef131bc	01422	MIR PUR SAKRO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	THATTA	t	2026-07-29 09:18:07.495	2026-08-01 08:22:25.335
e7e1f9e5-f906-4ada-885a-be749f422877	00111	MIRAN SHAH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:07.496	2026-08-01 08:22:25.338
fb2dc75a-415d-458b-b3e9-7be9168b1428	00829	MIROKHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:07.498	2026-08-01 08:22:25.341
b54548a7-69b9-4732-afcb-0cbdb7807928	00019	MIRPUR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.5	2026-08-01 08:22:25.348
cdd1bfc6-c3d7-4ee4-8c2c-3dbc104d8196	00976	MIRPUR (A. K)	Azad Kashmir	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MIRPUR (A. K)	t	2026-07-29 09:18:07.502	2026-08-01 08:22:25.351
870c7e08-724e-4080-9bd2-fa13ebc547a6	01352	MIRPUR BURRO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.504	2026-08-01 08:22:25.354
616e6d20-85e0-4247-b8cd-d740316f536b	00988	MIRPUR KHAS	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MIRPUR KHAS	t	2026-07-29 09:18:07.505	2026-08-01 08:22:25.36
2d8cf3fc-3338-4f00-b365-8810f1f7a81d	01004	MIRPUR MATHELO	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MIRPUR MATHELO	t	2026-07-29 09:18:07.507	2026-08-01 08:22:25.366
62899476-d62f-4cba-92e5-11f8eabcbfa5	01685	MIRUPR BATHORO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:07.509	2026-08-01 08:22:25.369
86a3bf06-4631-4120-98a6-a948e683b9f9	00996	MIRWAH GORCHANI	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	MIRPUR KHAS	t	2026-07-29 09:18:07.511	2026-08-01 08:22:25.373
c26c3a77-310d-4019-9723-c6c0c0ee47c0	00058	MIRZA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.513	2026-08-01 08:22:25.375
64c13409-f92d-43d7-aa0a-e920738b87bc	00715	MIRZA THAIR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.515	2026-08-01 08:22:25.383
81bfc550-8014-47e7-86a0-b0eff9c382db	00059	MISKEENABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.517	2026-08-01 08:22:25.386
69c16c45-8cba-4ef8-8091-09642a9436bc	00376	MISSA KASWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.519	2026-08-01 08:22:25.388
070d027f-6f64-4a3c-baab-490140c7669a	00519	MITHA TIWANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.521	2026-08-01 08:22:25.391
dcb1d2e4-b4b7-414b-b047-4e33ece82c21	00997	MITHI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:07.523	2026-08-01 08:22:25.394
354b0f11-4694-4eeb-a5b5-72f4a072ecce	01015	MITHIANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MORO	t	2026-07-29 09:18:07.525	2026-08-01 08:22:25.399
8fd331ae-b112-4737-8428-52d818cbbf15	01757	MITHLUKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.526	2026-08-01 08:22:25.403
8be4a83f-39c9-4ff7-8eac-d62d695598a7	00287	MITRANWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:07.529	2026-08-01 08:22:25.406
630f7def-a3b5-437d-90b1-92f4c76f65e4	02677	MITRO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.53	2026-08-01 08:22:25.408
c5ccd746-28e1-46d8-a0a0-d1666365c811	00377	MOHARA BHUTTIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.534	2026-08-01 08:22:25.422
22082082-176a-4cc6-834b-b03f437c32c0	00378	MOHARA CHINNA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.536	2026-08-01 08:22:25.426
9879034e-0f4d-44ac-8e98-4bac69ab676f	00222	MOHARA GULSHER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.537	2026-08-01 08:22:25.431
678c3756-edd6-4aca-a937-344f1b3e1b68	00549	MOHARWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:07.539	2026-08-01 08:22:25.434
ef30d12b-106d-4ed9-8e8c-4696ed69de68	00497	MOHINUDIN PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:07.541	2026-08-01 08:22:25.437
df9609a2-a440-4809-b283-86f30d0be9fe	00879	MOHLANWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANGA MANDI	t	2026-07-29 09:18:07.543	2026-08-01 08:22:25.44
804b7a14-0477-4577-b489-6f6eed430635	00302	MOHMMADPUR DIWA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.546	2026-08-01 08:22:25.443
6414bbb1-1d46-495b-9ee2-dccf2ee70552	00379	MOHRA MANDO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.547	2026-08-01 08:22:25.451
dc308c10-ad4a-445a-84e7-a20941daafae	00380	MOHRA NOORI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.549	2026-08-01 08:22:25.453
c5925532-0e32-4300-852d-5917ba44d514	00716	MOHRI SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.551	2026-08-01 08:22:25.456
efddd997-8857-4f18-95f7-1df77e76f746	00223	MOHUTA MOHRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.553	2026-08-01 08:22:25.459
a8b27c94-5dce-4447-9692-04b48c22e004	00872	MONA DEPOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.555	2026-08-01 08:22:25.466
d7cda32c-215d-4113-82a1-0a13fa592326	01191	MONG (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.556	2026-08-01 08:22:25.472
8bf1608a-16f4-4af3-92bf-b389074655e1	00955	MOOSA KHEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.558	2026-08-01 08:22:25.476
22b9e717-ccfa-4198-846e-4132fa4ac68d	00415	MORE AIMANABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.56	2026-08-01 08:22:25.485
ad3b85ea-353b-458a-aa0a-b9895d88ac3a	01298	MORE KHUNDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.562	2026-08-01 08:22:25.488
a1e81eba-c603-46f5-a630-97d8ca1b21c8	01012	MORO	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MORO	t	2026-07-29 09:18:07.564	2026-08-01 08:22:25.491
e8106dc1-9039-40b1-936b-4413792c0b92	01317	MOTRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.566	2026-08-01 08:22:25.493
eed88708-8ff5-4f50-9797-fc7c78550d8d	01753	MOUCH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.567	2026-08-01 08:22:25.499
e5e2dc2e-6f0a-4595-a4da-a469a6b3d892	00750	MOUZA HALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:07.569	2026-08-01 08:22:25.502
6a4a5870-bf68-4af6-aad4-d8ad9590626b	02652	MUBARAK PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:07.571	2026-08-01 08:22:25.506
b1cbc771-c69c-4443-b14a-c59d1c0c04f3	01192	MUJAHID ABAD (A	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.573	2026-08-01 08:22:25.51
2f80ef35-ffd2-4022-bff5-4e61d586cbf2	00224	MULHAL MUGHALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.575	2026-08-01 08:22:25.516
16c9803c-f80f-49a2-a560-5bb145d48d61	01017	MULTAN	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	MULTAN	t	2026-07-29 09:18:07.577	2026-08-01 08:22:25.519
444b985d-63f7-44a8-93c1-4e0849d33908	01393	MULTAN KHURD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:07.579	2026-08-01 08:22:25.522
8e19311b-f011-4f18-af71-9d024aacb8f4	00964	MINGORA  (SWAT)	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MINGORA  (SWAT)	t	2026-07-29 09:18:07.487	2026-08-01 08:22:25.308
39862dcb-f98d-4e51-8099-a596d11a7cc9	00225	MURID	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.584	2026-08-01 08:22:25.539
42f13e1e-89a4-476a-a61f-d3beea9f616d	01254	MURID WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.586	2026-08-01 08:22:25.547
efd0f554-1dfb-4ed5-9367-92e864964e6f	00790	MURIDKE	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	LAHORE	t	2026-07-29 09:18:07.588	2026-08-01 08:22:25.55
2532c02c-4c98-4436-ad4f-cc77cc4254cc	01020	MURREE	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MURREE	t	2026-07-29 09:18:07.589	2026-08-01 08:22:25.552
1580928d-7051-4b17-95e3-44025da8b1c1	00060	MUSA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.592	2026-08-01 08:22:25.557
f14006be-79fa-4667-bf4f-e1755f1c5697	01167	MUSLIM BAGH	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.593	2026-08-01 08:22:25.566
e25fdde1-bad5-4ddd-bcec-9ee624d0baf0	00020	MUSLIMABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.595	2026-08-01 08:22:25.573
62c0c4df-6048-4760-b29e-2d3b1cab3e04	01699	MUZAFFARABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.597	2026-08-01 08:22:25.577
853f621b-d54f-4b12-aeaf-ee1b95ffd1ef	01043	MUZAFFARABAD(AK)	Azad Kashmir	58dae26b-44d2-43ac-9424-1a7926196e32	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.599	2026-08-01 08:22:25.583
4795911a-34b3-4fe8-a81c-e03a82188151	01067	MUZAFFARGARH	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MUZAFFARGARH	t	2026-07-29 09:18:07.601	2026-08-01 08:22:25.589
9593fa9e-afd9-4175-b654-073e5052f3d1	01740	MUZAMABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.603	2026-08-01 08:22:25.607
87429af7-456b-4ce4-8e85-786f70db0d0b	00773	NAKIYAL (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.604	2026-08-01 08:22:25.61
ac146acb-e4a8-4687-a228-479817d83d20	01193	NAKKAH BAZAR(A.	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.606	2026-08-01 08:22:25.62
2356625c-7e96-4304-aa9b-8b1579fc7ec7	00576	NAKODAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.608	2026-08-01 08:22:25.622
31356c3a-922d-4302-8b08-dcdf981f779d	01756	NALLI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.61	2026-08-01 08:22:25.625
fa84cec6-5828-425f-ba04-ce1f6110cc0a	01299	NANKANA SAHIB	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SHEIKHUPURA	t	2026-07-29 09:18:07.612	2026-08-01 08:22:25.63
58f51fa9-5af9-4aa8-a4fe-eeb229810eee	00381	NARALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.616	2026-08-01 08:22:25.635
f2c506ce-16ce-43fd-a4b2-a71050bf80e9	01019	NARANG MANDI	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MURIDKE	t	2026-07-29 09:18:07.617	2026-08-01 08:22:25.65
8d40b2a7-4016-4064-8e52-c20dc3eb0a5f	00021	NARIAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.619	2026-08-01 08:22:25.653
e01920ea-a65b-40a8-99f3-d664de70a702	01194	NARIAN SHARIF	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.621	2026-08-01 08:22:25.656
5f0584e1-5f98-48a5-b3d9-ab595d339fdd	01082	NAROWAL	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	NAROWAL	t	2026-07-29 09:18:07.623	2026-08-01 08:22:25.658
c7963207-be2e-4a03-a44d-4c6afa361bcb	00717	NASEERA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.624	2026-08-01 08:22:25.667
75cc6a3d-828e-44a6-804a-b7ae40d35fab	00638	NASIRABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:07.627	2026-08-01 08:22:25.669
955470a8-ca47-4b8a-a6fb-4399617c9bd6	00022	NATHIA GALI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.629	2026-08-01 08:22:25.671
c1bab283-f10b-4c4c-a076-781d5e140974	00831	NAUDERO	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	LARKANA	t	2026-07-29 09:18:07.631	2026-08-01 08:22:25.674
3b12c780-a052-4572-a58d-a172eb74cbf6	00417	NAUKHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.633	2026-08-01 08:22:25.692
8a29f562-8503-4adb-907a-9f3dd4462ccb	01089	NAWAB SHAH	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	NAWAB SHAH	t	2026-07-29 09:18:07.634	2026-08-01 08:22:25.709
433d582c-0279-4e7d-9a61-be823f502cf2	00149	NAWAN JANDANWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:07.636	2026-08-01 08:22:25.724
512e9203-4099-43cb-846b-e2801070bf60	00912	NAWAN KILLI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:07.638	2026-08-01 08:22:25.727
66cad2ca-2dea-4bff-8efa-8efd33101fe9	00023	NAWAN SHER	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.64	2026-08-01 08:22:25.732
9fd2c373-d232-465e-a99b-58c785c779ae	01723	NAZAM PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.641	2026-08-01 08:22:25.736
d64f6440-d46f-4be1-90c8-7430025257d4	00340	NBP 154 G.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:07.644	2026-08-01 08:22:25.74
80527407-57b3-464b-8143-c97e326e6141	00341	NBP 178 G.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:07.646	2026-08-01 08:22:25.742
80217655-0a47-4057-9a14-8eca1db2b8aa	00342	NBP 248 G.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:07.649	2026-08-01 08:22:25.749
5980bd2a-75ae-496b-88d1-7b7a03e047e2	00343	NBP 303 J.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GOJRA	t	2026-07-29 09:18:07.65	2026-08-01 08:22:25.752
9e8b2910-8fa2-42b5-9d4a-7f86e6cc0fe6	01425	NBP 327 J.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:07.652	2026-08-01 08:22:25.755
e1e402dc-bbe5-455c-8a78-ed8d8cb0b250	01255	NBP 409 GB JALL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.654	2026-08-01 08:22:25.759
458e6cf9-2f9b-42f6-a11a-9bbc41f095ff	01256	NBP 47 G.B	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.656	2026-08-01 08:22:25.766
bf62d2be-0fe0-44ec-b4d7-f2745fe29991	01257	NBP SOUNDH ADDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:07.659	2026-08-01 08:22:25.77
162ac03f-96d8-4dd5-9200-e10e7b969431	01272	NEHANG	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.661	2026-08-01 08:22:25.772
caafc396-cc7a-427a-8129-3dd33817fc3f	00775	NEW AFZALPUR(AK	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.663	2026-08-01 08:22:25.775
5b7e2583-bdde-409d-90f4-4c6e3ef06724	01016	NEW JATOI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MORO	t	2026-07-29 09:18:07.665	2026-08-01 08:22:25.782
21670538-36c1-4089-a258-d24f8f1f2b59	01061	NEW MOHALLA	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.667	2026-08-01 08:22:25.785
bd918116-913a-40eb-a963-dea4bce45c47	00895	NEWDARBAND TOWN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:07.669	2026-08-01 08:22:25.788
5a4d0b1e-9ebf-4f61-9742-2753e16c1e33	01462	NIZAMABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:07.671	2026-08-01 08:22:25.793
95cbeb0d-93a7-4a07-9b99-8e5ee634d613	00577	NLC CAMP	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.672	2026-08-01 08:22:25.797
eb68fac7-d919-4830-bf93-6b05dd590f33	01062	NOMANPURA	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.674	2026-08-01 08:22:25.8
b1c37e50-c226-4c1b-b003-ff4a0c326484	01745	NONAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:07.676	2026-08-01 08:22:25.802
ad0a0504-30e1-4f87-a0d7-3d657e4e987c	00416	MURALI WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.582	2026-08-01 08:22:25.536
85fd28b1-ce2d-4a1a-a9f1-036ad948e53e	02516	NOORI ABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:07.682	2026-08-01 08:22:25.808
9f3da831-c53f-41d1-8c8e-2a03e3e8a3ec	01679	NOORIABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:07.684	2026-08-01 08:22:25.81
f29bb129-f4cf-4b4d-a57f-b8592e8d76ce	00226	NOORPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.685	2026-08-01 08:22:25.817
d2601953-4e41-450c-90fc-4e002e3cb1bc	00105	NOORPUR NORANGA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:07.687	2026-08-01 08:22:25.82
a10aa72c-c89e-4bc4-8567-2bb1794613b3	00520	NOORPUR THAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.689	2026-08-01 08:22:25.825
65782953-8f79-4eb1-8c7d-11990b38cd60	00150	NOTAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:07.691	2026-08-01 08:22:25.827
9317bd13-9359-45f2-8c79-c5275781bf01	00998	NOUKOT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:07.693	2026-08-01 08:22:25.831
3293b356-3624-40e3-9acd-e5e5608e8337	00303	NOUTAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.695	2026-08-01 08:22:25.833
0b3668b2-ef39-4414-ae2b-a362067af8df	01101	NOWSHERA	Khyber Pakhtunkhwa	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	NOWSHERA	t	2026-07-29 09:18:07.697	2026-08-01 08:22:25.836
94c05a73-1cd3-40ec-b4c0-9562283c3e65	00521	NOWSHERA DT. KH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.699	2026-08-01 08:22:25.839
6a2a54b7-4f20-4a77-9de6-0f891e604ee3	00404	NOWSHERA VIRKAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.701	2026-08-01 08:22:25.841
bfd8b9e8-5889-46c5-a469-a16e36c12da3	01120	NOWSHERO FEROZ	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:07.704	2026-08-01 08:22:25.85
c6f7b777-186e-45d1-9eea-353bc717ef09	00461	NRTC(TELECOM ST	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.705	2026-08-01 08:22:25.853
68607891-cac6-4e05-b8bb-b15ac614225f	01159	NUSHKI	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.708	2026-08-01 08:22:25.856
41b77da0-758e-471b-807f-67107aa37f76	00522	OCHAALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.712	2026-08-01 08:22:25.858
3bd9c85b-fddd-4c7a-9900-2a35401c4893	00227	ODHERWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.715	2026-08-01 08:22:25.866
7e5e5ca4-3869-4102-a44f-9d02aeb6b92f	01124	OKARA	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	OKARA	t	2026-07-29 09:18:07.729	2026-08-01 08:22:25.87
2ad46788-2725-422d-971a-12b3f813fc4f	00523	OLYMPIA CHEMICA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.732	2026-08-01 08:22:25.874
c943d487-02e7-412d-91bb-32bef70060b3	01168	OREMARA TOWN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.734	2026-08-01 08:22:25.883
e98eb249-dc65-402b-a41e-a21925f7aada	00896	OUGHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:07.737	2026-08-01 08:22:25.885
17bf8aeb-cdb6-47cd-89ac-f06e2004885e	01096	PACCA CHANG	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:07.741	2026-08-01 08:22:25.892
3584d67c-41e6-4303-9401-0fe526fbc4f8	01121	PADIDAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:07.743	2026-08-01 08:22:25.899
f0254eae-aa06-409b-82e9-8601e89f9500	00524	PADRAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.746	2026-08-01 08:22:25.902
fa269dfd-b519-4a85-8319-00e8ba8120f5	00228	PADSHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.748	2026-08-01 08:22:25.905
23e583a1-7aed-4afc-928b-aa08a598caa1	01037	PAF BASE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.75	2026-08-01 08:22:25.909
56a00a2f-8a63-4be8-9ca1-b91ab133f00d	00850	PAHARPUR THAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:07.753	2026-08-01 08:22:25.921
df43712c-e9cc-464f-b843-a361fcbdf100	00873	PAHRIANWALI ADD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.755	2026-08-01 08:22:25.923
97b3b4b0-63b7-4a87-a18f-6dedfb41a88e	00304	PAIGAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:07.758	2026-08-01 08:22:25.927
f22f8eee-82e5-45bb-a8ad-a179ecfecd71	01759	PAIKHEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.76	2026-08-01 08:22:25.935
cf2c90eb-acbe-4e96-ad78-6196ad7a8f58	00525	PAIL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.762	2026-08-01 08:22:25.944
01c720e7-9163-4600-b547-b343bf363d85	00578	PAKHWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.765	2026-08-01 08:22:25.953
57b0b88a-50af-4a30-9f26-eaeacaa26b2d	00382	PAKKA KHUH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.767	2026-08-01 08:22:25.964
82f33162-3a63-4015-8550-fdc5484a8fe2	02670	PAKKA LARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LIAQATPUR	t	2026-07-29 09:18:07.768	2026-08-01 08:22:25.97
84e17faa-3195-4744-bbe6-7ae880a81648	01238	PAKPATTAN	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	SAHIWAL	t	2026-07-29 09:18:07.77	2026-08-01 08:22:25.981
ad0564bc-5bf4-4f63-82ee-d6ac7f8f376f	01700	PAKPATTAN SHARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.772	2026-08-01 08:22:25.989
648bcce7-2461-486e-9257-806c46ed8940	00776	PANAG GALI (A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.773	2026-08-01 08:22:26.002
8077cc63-e223-4a57-90b2-493217536935	00463	PANDAK	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.776	2026-08-01 08:22:26.016
a43fcff4-618b-43d4-8000-1a265c019368	00984	PANDI SABARWAL	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:07.778	2026-08-01 08:22:26.026
e47daa10-b54a-4ba5-8b78-240a7ef20eb5	00579	PANDORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.779	2026-08-01 08:22:26.036
7a880d20-df71-4f04-9b66-97e0d739e93f	00691	PANG KASI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:07.781	2026-08-01 08:22:26.047
8072a3a8-a1fb-49ee-83fc-f8aad0c310e2	00464	PANIAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.783	2026-08-01 08:22:26.054
27bb9d65-4e45-4e84-b322-7d73e90b6f5e	00719	PANJAN KISANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.784	2026-08-01 08:22:26.059
d6a28023-bffa-430e-925c-1aad2b399fdf	00777	PANJEERA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.786	2026-08-01 08:22:26.07
c2a0ea7b-6d90-4d70-9274-85258f02bd11	00600	PANJGOUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PANJGOUR	t	2026-07-29 09:18:07.788	2026-08-01 08:22:26.082
7cded3bf-7a23-4921-8d5a-3b961bc8e82c	01746	PANJGRAIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:07.789	2026-08-01 08:22:26.092
50596034-9376-4c9c-826b-6b340bb06cea	04045	PANJRIO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:07.791	2026-08-01 08:22:26.102
40cc894f-62c1-468a-816c-1dd7090e698a	01353	PANO AQIL	Sindh	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SUKKUR	t	2026-07-29 09:18:07.793	2026-08-01 08:22:26.115
47b1a4ec-39c1-44e8-86d7-4765f282f688	00313	PANYALA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.795	2026-08-01 08:22:26.128
7b221c87-b128-4091-806d-0d314ddb18b5	01241	NOOR SHAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:07.68	2026-08-01 08:22:25.806
bdd53715-8dca-4035-afd0-96d81b3cf70f	01112	PAR NOWSHERA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:07.8	2026-08-01 08:22:26.147
d7757fbf-ebbe-4fc5-aea5-25c557687c86	00741	PARACHINAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:07.802	2026-08-01 08:22:26.157
10e6e871-6b90-4941-a5b6-4c7d263569b1	01722	PARAYANWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.803	2026-08-01 08:22:26.171
07e25f49-f346-4c6e-a6b4-b2f2a2f921b3	01394	PARHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:07.805	2026-08-01 08:22:26.179
a0b425f1-a017-4287-afa5-640d6040668b	00595	PASNI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:07.809	2026-08-01 08:22:26.198
85c79b1c-6953-4c60-8c78-6758282cfb3b	01133	PASRUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PASRUR	t	2026-07-29 09:18:07.811	2026-08-01 08:22:26.207
72046f41-acd5-49a2-8f24-ede153000af6	01063	PATTIKA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.813	2026-08-01 08:22:26.219
4e304d21-b1ba-4ac3-8ed2-e685d368f968	01135	PATTOKI	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	PATTOKI	t	2026-07-29 09:18:07.814	2026-08-01 08:22:26.227
5e4b37ab-08f7-4c62-bcbd-bf74f383e57b	00465	PCFL -HPFL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.816	2026-08-01 08:22:26.241
252d317c-5f55-41d1-8df8-e6bc17e48a72	00315	PEEZU	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.817	2026-08-01 08:22:26.247
3ae0da66-ae66-4333-b797-12a107b6ab47	01661	PENDING BYHAND	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:07.819	2026-08-01 08:22:26.259
6dd869d7-e946-4294-a402-94452ff0678b	00229	PERIAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.821	2026-08-01 08:22:26.269
3dfeaec9-6f97-4880-8e91-4d4fa4dc44d0	01140	PESHAWAR	Khyber Pakhtunkhwa	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	PESHAWAR	t	2026-07-29 09:18:07.822	2026-08-01 08:22:26.278
18954532-190c-48fd-a9d2-b2d3d7cf4295	01038	PHAGWARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:07.824	2026-08-01 08:22:26.286
4abc9388-f7fd-4a2c-9047-e6f58543b0f8	00956	PHAKI SHAH MARD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.826	2026-08-01 08:22:26.296
06c8c03a-e10c-49be-a760-77125d5cea83	00874	PHALIA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.829	2026-08-01 08:22:26.307
567cf5f3-4d13-4d9d-a41b-9320477703cc	00316	PHARPUR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.83	2026-08-01 08:22:26.317
f6d5eafc-c6c7-4f28-b1b3-3e91d4412c52	02629	PHOOL NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	BHAI PHERU	t	2026-07-29 09:18:07.832	2026-08-01 08:22:26.323
daea868e-d75c-455f-ac79-448c4e6c0ba2	01122	PHUL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:07.834	2026-08-01 08:22:26.33
0b936742-d52f-4e68-8c8b-22171efda62d	02630	PHULAR WAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.835	2026-08-01 08:22:26.338
b8a82723-26d5-4de4-b141-9bebe0a845cb	00260	PHULJI STATION	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	DADU	t	2026-07-29 09:18:07.837	2026-08-01 08:22:26.351
bd8b1488-c896-435b-97fb-fb3c7bd59601	01274	PHULLARWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.838	2026-08-01 08:22:26.36
3f68276e-df35-475d-9bcb-68244e2e9eea	00261	PIARO GOTH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	DADU	t	2026-07-29 09:18:07.84	2026-08-01 08:22:26.367
f1ba7cac-7536-4339-853d-857376273dce	01395	PICHNAND	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:07.842	2026-08-01 08:22:26.376
0895b529-b283-4a6e-8836-d14b696ef948	01150	PINANWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PIND DADAN KHAN	t	2026-07-29 09:18:07.844	2026-08-01 08:22:26.386
172f83b6-7436-4504-8d6a-d856c45afee0	01145	PIND DADAN KHAN	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	PIND DADAN KHAN	t	2026-07-29 09:18:07.846	2026-08-01 08:22:26.393
2e24429f-db7d-45cc-a008-e53ce0eb009f	00466	PIND HASHIM KHA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.847	2026-08-01 08:22:26.401
a9df964e-9e9e-4b56-a078-37d96638effb	00276	PIND KALAN(A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:07.849	2026-08-01 08:22:26.411
2fecd696-0906-41b5-8051-581141a8d22f	00024	PIND KARGO KHAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.851	2026-08-01 08:22:26.423
0a286614-3560-4ab1-8831-789f9a7a403f	00277	PIND KHURD(A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:07.852	2026-08-01 08:22:26.437
3b638cf8-26da-41f4-9666-00f8934cce26	00467	PIND MUNIM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:07.854	2026-08-01 08:22:26.446
3adf5cfa-fde1-48b0-91e9-8198abd914c9	01223	PIND PARACHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.855	2026-08-01 08:22:26.452
38ee114c-f785-451e-85f9-529a63298752	01224	PIND SULTANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.857	2026-08-01 08:22:26.471
68cbc03f-6013-4550-8e83-4df75bbcbf50	01300	PINDI BHATTIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.859	2026-08-01 08:22:26.479
869a9ba6-ff37-41b2-95f7-7e14598479a9	01205	PINDI GHEB	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:07.861	2026-08-01 08:22:26.489
60868892-12bd-464a-a59b-daca1ce00b91	00230	PINDI GUJRAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:07.863	2026-08-01 08:22:26.495
99b178b9-0c64-4167-938b-fc24dbb49e3a	00720	PINDI RAMPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.865	2026-08-01 08:22:26.511
fa23f74a-d7a8-4091-85c7-518cba6cf457	00526	PIONEER CEMENT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.867	2026-08-01 08:22:26.574
9c4d6593-fd43-4300-9bc3-32a6f892cebd	00851	PIR JAGI(CHAK 1	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:07.868	2026-08-01 08:22:26.579
70058f2a-a476-4cdd-9f2b-ccf116c68c23	00679	PIR JO GOTH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:07.87	2026-08-01 08:22:26.601
76c7f422-64a5-47d1-b79e-149d7725bd9d	01113	PIR SABBAQ	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:07.871	2026-08-01 08:22:26.645
04d88fe5-bdd8-4049-8720-c82e6fae1f40	01354	PIR YALO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.873	2026-08-01 08:22:26.658
19c56b36-38ff-4de3-885c-369664d24a2b	00132	PIRAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:07.875	2026-08-01 08:22:26.7
1f57287d-5f85-4048-8592-d748811678db	00175	PIRBABA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:07.877	2026-08-01 08:22:26.734
9a246670-2040-458c-b73f-a691be8bb2fc	01426	PIRMAHAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:07.879	2026-08-01 08:22:26.756
35af6fe8-7380-4e4a-92cc-ee22c4d7cfee	00933	PIROWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.881	2026-08-01 08:22:26.766
3c2dbf92-c297-43e3-99eb-69f90dbf6724	01153	PISHIN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:07.883	2026-08-01 08:22:26.798
860c3bac-813c-497c-94d0-cdd8348ef589	00999	PITHORO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:07.884	2026-08-01 08:22:26.866
74c50bcf-ff3a-4ffe-8c83-316ad6f5be84	00778	POTHA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.89	2026-08-01 08:22:26.932
14983afc-0bf7-4b8f-8507-6d5e27abdabd	01448	POURMIANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAH CANTT.	t	2026-07-29 09:18:07.892	2026-08-01 08:22:26.975
e4d202c2-9621-4a20-92de-aafa2d6efa14	00025	PUBLIC SCHOOL(A	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:07.894	2026-08-01 08:22:26.992
76b25317-bb08-46e2-9df6-59bfa1967be6	00779	PULENDRI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.896	2026-08-01 08:22:27.008
59cae93a-70f8-4569-9de7-f47820e52eea	01275	PULL 111 CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.897	2026-08-01 08:22:27.042
c4f8c38e-21a6-4cf6-8731-cc56dbc4ffd3	00151	PULL 214  TDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:07.899	2026-08-01 08:22:27.074
e748c58c-f4e3-4291-9c1e-8e114bc3564c	00934	PULL BAGER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.901	2026-08-01 08:22:27.086
9f820433-d7be-4adc-b658-884d281ee129	00985	PULL MANDA (A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:07.902	2026-08-01 08:22:27.1
79a3de19-7342-4eba-b33d-d07734190901	00692	PULL NO.  14	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:07.904	2026-08-01 08:22:27.146
4b72fcb1-41d6-4aa6-b8c5-a61c5d300611	00935	PULL NO. 12 MEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.906	2026-08-01 08:22:27.17
cb8a68a9-aebd-49b0-80ab-2075609f8742	02667	PULL RANGO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:07.907	2026-08-01 08:22:27.172
0a1d342e-83a2-4405-9884-79239c76e796	02681	PULL SUNNY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAHIM YAR KHAN	t	2026-07-29 09:18:07.91	2026-08-01 08:22:27.174
ab27ef58-5129-4618-8be0-7b668e36876f	00936	PUNJAB SUGAR MI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.911	2026-08-01 08:22:27.175
79c5b850-facb-44a1-a413-986509aa159b	01301	PUNWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:07.913	2026-08-01 08:22:27.178
54364afe-666b-4356-ac77-09e4cda2b9ab	01134	PURAB KLAIR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PASRUR	t	2026-07-29 09:18:07.915	2026-08-01 08:22:27.181
0413090d-4877-4633-b357-72a54504a2a5	00580	PURAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.916	2026-08-01 08:22:27.182
d80290bd-9ca4-497b-ba52-3469a6599849	01243	QABOOLA SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:07.918	2026-08-01 08:22:27.184
40c541dc-9fe4-483f-9258-80fa2e1f9a4d	00875	QADIRABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:07.92	2026-08-01 08:22:27.186
fc5a5710-64fd-4be8-aa8e-9a7dc8618300	00527	QAIDABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.923	2026-08-01 08:22:27.19
5254d462-3f8b-4bfc-829d-360e6e406720	00897	QALANDARABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:07.925	2026-08-01 08:22:27.192
cbafbf95-ecf6-446a-b460-50125a0f9dca	00957	QAMAR MASHANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.927	2026-08-01 08:22:27.195
c918888e-dc25-4c03-8c95-36749fe66a3b	01078	QASBA GRT. CHAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.929	2026-08-01 08:22:27.197
03ab2e20-21e3-4a85-8830-a4098098a183	02682	QASBA MARAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHUJABAD	t	2026-07-29 09:18:07.931	2026-08-01 08:22:27.199
85d03773-1e64-4509-8a1d-fe3f0f8e99f5	01097	QAZI AHMAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:07.932	2026-08-01 08:22:27.201
e9fd1c53-c6e3-4da8-a8eb-4726cb42bdb9	00062	QAZI PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.934	2026-08-01 08:22:27.203
e64e66ac-4841-4e38-85b5-57144434e366	00383	QAZIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.935	2026-08-01 08:22:27.205
0243ad18-51ca-45fd-bf20-a1d410bd8468	00405	QILA DEDAR SING	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	GUJRANWALA	t	2026-07-29 09:18:07.937	2026-08-01 08:22:27.207
28d64daa-0929-43c6-9469-14c74bed4a58	01713	QILA KALLARWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.939	2026-08-01 08:22:27.209
298b6e0b-dea2-4d00-84eb-726e76150e08	01318	QILA SAIFULLAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.94	2026-08-01 08:22:27.212
b909aa97-215e-4ab1-a2a7-a18946f1ee30	01196	QILLAN  (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.942	2026-08-01 08:22:27.214
b6cf9b14-e8bd-43ba-a906-bd3af629ed3a	00832	QUBO SAEED KHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:07.945	2026-08-01 08:22:27.216
8af72842-04c5-4c9c-874c-84217459d643	01151	QUETTA	Balochistan	ee2726a8-1562-48a2-a5a8-9daa99729f7a	QUETTA	t	2026-07-29 09:18:07.946	2026-08-01 08:22:27.218
6f3d655b-2c2d-4071-9b00-e5e660c9ee06	02645	QUTAB PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:07.948	2026-08-01 08:22:27.221
b3ea332a-b440-4e1d-a350-a634b5401d0d	01410	RABAT BAZAAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:07.949	2026-08-01 08:22:27.224
38bca053-e8b9-48f4-9693-b8b1168f1253	01169	RABWA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	RABWA (Chenab N)	t	2026-07-29 09:18:07.951	2026-08-01 08:22:27.226
2cd4d13c-1529-446e-9773-7e0a969433d3	00833	RADHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:07.953	2026-08-01 08:22:27.23
1c409f14-37d9-4d74-bea8-8ee2cb5feeac	01276	RADHEN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:07.954	2026-08-01 08:22:27.232
d35b7763-d2ed-46b5-943b-047f8adfab4e	01785	RAFIQABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:07.956	2026-08-01 08:22:27.234
29e35c37-834d-41f2-abaf-8bc3994a630f	01170	RAHIM YAR KHAN	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	RAHIM YAR KHAN	t	2026-07-29 09:18:07.958	2026-08-01 08:22:27.236
1213910f-e5bf-4e1d-9bee-4f6543165489	00418	RAHWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.96	2026-08-01 08:22:27.238
8f3557e8-f035-4a16-92ae-1ed24d0f8d80	01171	RAIWIND	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	RAIWIND	t	2026-07-29 09:18:07.962	2026-08-01 08:22:27.24
41dcea48-9c16-4dcb-bd5a-f70805987f98	00419	RAJA SADOKEY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.964	2026-08-01 08:22:27.242
ae2d2134-c731-4d5e-a9a4-db2f54f0e4f7	01427	RAJANA	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	TOBA TEK SING	t	2026-07-29 09:18:07.965	2026-08-01 08:22:27.246
ab5fdfaf-e6a2-4b30-bf36-c4caee8b2c3e	00305	RAJANPUR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	DERA GHAZI KHAN	t	2026-07-29 09:18:07.967	2026-08-01 08:22:27.248
45e0bc72-53c8-4715-982d-6160b90913e1	00913	RAJAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:07.968	2026-08-01 08:22:27.25
622f28a6-b837-4e57-bdf5-9e4f0f81f539	00581	RAJI PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.97	2026-08-01 08:22:27.257
b6847d9a-11f6-46cc-a84b-f39c79e060b3	00288	RAJUKE (STOP)	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:07.972	2026-08-01 08:22:27.259
3938f07a-95db-4827-b351-72da179a2166	00582	RAJWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.973	2026-08-01 08:22:27.263
f9916258-8eae-48b2-831a-1a83d91154ab	01715	PONCH (A K)	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A K)	t	2026-07-29 09:18:07.888	2026-08-01 08:22:26.913
1bd4f065-634f-40e1-9fc9-6e7ccf8cf14f	01718	RANDHEER MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:07.979	2026-08-01 08:22:27.269
1a35707e-655b-4a97-8e62-8e2743bcca58	01064	RANGLA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:07.981	2026-08-01 08:22:27.271
3457ad6b-f51f-4b72-a384-f14f05963105	00063	RANGO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:07.983	2026-08-01 08:22:27.273
36ed28a9-2658-4c58-932d-f404147e26b3	00528	RANGPUR BHAGOR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:07.984	2026-08-01 08:22:27.275
8fe85859-d4ad-4963-bd64-3a72858c8704	00583	RANI GHEE MILLS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.986	2026-08-01 08:22:27.279
ff5fd28e-7b1f-422d-9976-3a1a08bd84f6	00680	RANI PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:07.987	2026-08-01 08:22:27.281
4284e972-8dc1-4a26-ae28-9030f5be4bd2	00289	RANJHI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:07.989	2026-08-01 08:22:27.288
efd04553-d9ef-474e-a015-73775760b500	00914	RASHAKAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:07.991	2026-08-01 08:22:27.29
d70e1091-f716-4996-9909-7b8096f10412	01710	RASOOL NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.993	2026-08-01 08:22:27.293
ff8ae2a0-8553-4266-ab1a-119265f6c1ec	00420	RASOOL PUR TARR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:07.995	2026-08-01 08:22:27.295
f1db13af-f339-4b16-b86c-b999a690e940	00584	RATHIAN STATE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:07.997	2026-08-01 08:22:27.298
0853820f-941d-4243-bd07-d32439471e5b	00834	RATODERO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:07.998	2026-08-01 08:22:27.299
25ea2e0f-4a01-439f-920a-5b33cd322a5a	01173	RAWALAKOT (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:08	2026-08-01 08:22:27.303
3342dde9-27fc-4cf9-8eb9-1c3d5ce261cd	01202	RAWALPINDI	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	RAWALPINDI	t	2026-07-29 09:18:08.002	2026-08-01 08:22:27.312
cbd6483b-68fd-4c24-bd16-2b60f24f9db8	00384	RAWAT	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	GUJAR KHAN	t	2026-07-29 09:18:08.003	2026-08-01 08:22:27.315
11494a61-5d42-4b32-be1e-4d58648bf00f	01100	REHMANI NAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:08.005	2026-08-01 08:22:27.317
f94ac67f-a296-4878-b793-9285fb601778	00026	REHMATABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.006	2026-08-01 08:22:27.343
7ebbc3ce-a712-47d5-9681-74aa297b52ec	01129	RENALAKHURD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	OKARA	t	2026-07-29 09:18:08.008	2026-08-01 08:22:27.348
679bc74e-6a11-49ac-a7cb-203631412034	01371	RIGHT BANK COLO	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:08.01	2026-08-01 08:22:27.35
6b9c380e-8a78-4c85-adb4-275e6778d0e0	01114	RISAL PUR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:08.012	2026-08-01 08:22:27.352
0585b44e-0016-4a0c-8740-20e12e9d639b	00529	RODA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.014	2026-08-01 08:22:27.354
6d8c012f-6d2a-4d77-b029-40d931c7bbfc	01079	ROHALANWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:08.015	2026-08-01 08:22:27.355
375a06d1-be43-48b8-9a5e-a8175082a9cb	01356	ROHRI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.017	2026-08-01 08:22:27.358
ad2744ba-95cd-4fb9-86fa-ea584cc15164	01233	ROJAHN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:08.019	2026-08-01 08:22:27.36
762677a6-b13c-445b-b31c-1ac75fcbe50c	00876	RUKKUN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:08.022	2026-08-01 08:22:27.366
85799a79-588a-4d6a-b665-e6871b9831af	00915	RUSTAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.023	2026-08-01 08:22:27.368
997be22b-acd2-4dfc-83b2-5e43528f7d87	00742	SAADA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:08.026	2026-08-01 08:22:27.37
a1162dbb-6062-476e-a3a3-2e2b878da59a	00585	SAADAT PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:08.027	2026-08-01 08:22:27.372
e7cd696a-d26c-44e2-b0c8-c3c7bd670bc1	00668	SABIRA ABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KARK	t	2026-07-29 09:18:08.029	2026-08-01 08:22:27.375
0a2cff84-8a74-440a-ac06-b4abc0da9c08	00444	SABOOR SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:08.031	2026-08-01 08:22:27.379
0d48aab6-a963-4dd0-aac7-0709625aa31d	04018	SABU DERO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:08.033	2026-08-01 08:22:27.381
fa83d556-9a8d-4339-b687-76d3ab5ad58f	00385	SACOTE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.035	2026-08-01 08:22:27.383
57d24b0b-dce6-4c78-9376-93faa6b914cb	04112	SADA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADA	t	2026-07-29 09:18:08.036	2026-08-01 08:22:27.385
a0619be8-93d6-4fff-8ac9-45e786ce72da	01228	SADIQABAD	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SADIQABAD	t	2026-07-29 09:18:08.038	2026-08-01 08:22:27.387
b5dbb3be-72b0-4b4a-bffc-c46ac63e026a	01319	SADRA BADRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:08.04	2026-08-01 08:22:27.389
ddb6b7d8-cd1d-4238-b5ff-06541b58d7a6	00231	SADWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.042	2026-08-01 08:22:27.39
c60d21f0-3c61-4f79-9157-736a5af4221d	00483	SAEEDABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:08.044	2026-08-01 08:22:27.392
276c106f-0e24-4c58-bb5d-0612beb3fc0a	01302	SAFDARABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:08.046	2026-08-01 08:22:27.395
6ba7ef5b-bc68-4353-b123-aadf9fb4240d	00232	SAGHAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.047	2026-08-01 08:22:27.398
e57dd354-19a7-44fb-af46-e16a89f0b3c8	00386	SAGRI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.049	2026-08-01 08:22:27.4
395c594d-e7ef-493f-a1a5-f4b1e306c87f	01411	SAHIB ABAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:08.051	2026-08-01 08:22:27.401
65590ade-e19c-404d-bade-9d7e9fb76f1a	01236	SAHIWAL	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SAHIWAL	t	2026-07-29 09:18:08.052	2026-08-01 08:22:27.404
63322653-9f00-485e-abe4-2f649df6e0bf	01277	SAHIWAL (NAWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:08.054	2026-08-01 08:22:27.406
16af2cba-5a72-46ce-a7a8-29e7a1ea084c	00387	SAHOT SADDRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.056	2026-08-01 08:22:27.409
d9ae6954-3cb8-4ef0-90a7-ced38bf816f2	01320	SAHOWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:08.057	2026-08-01 08:22:27.413
b4762618-c49f-494b-8c11-252707905b2c	00233	SAIGALABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.061	2026-08-01 08:22:27.431
f4c8f88a-1954-44d9-b711-5e01627c38db	00388	SAINTHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.063	2026-08-01 08:22:27.433
579c26e7-e2f0-47c8-baac-581cc4d16171	00317	RAMAK	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.977	2026-08-01 08:22:27.267
7bb0f836-1d9b-45b4-943e-827ac561e01d	01727	SALAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:08.068	2026-08-01 08:22:27.503
b1bca31f-c28c-462e-8838-96e89b7c7237	01702	SALARWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.07	2026-08-01 08:22:27.506
29aa6ecf-caf7-4750-b2ea-bf97fa6eeae5	00421	SALEEM PURA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.071	2026-08-01 08:22:27.508
53a0d222-8707-4df5-82c8-0ca3ddc29f19	02601	SALEH PAT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	JACOBABAD	t	2026-07-29 09:18:08.073	2026-08-01 08:22:27.513
72ab5dbd-91e9-4c4b-86f0-8c12a2357fc0	00027	SALHAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.075	2026-08-01 08:22:27.515
ea71bdd5-9a99-4d03-88a4-7f562f29cae5	00234	SALOI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.077	2026-08-01 08:22:27.518
1ac8c63c-335a-4194-a92d-22fe2ab0c20f	02656	SAMA SATTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:08.079	2026-08-01 08:22:27.52
449d1a1a-a830-44cf-bc46-a298505a53af	01000	SAMARO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:08.081	2026-08-01 08:22:27.522
7a9e2bb6-c578-4f29-8b04-8e163547af30	01321	SAMBRIAL	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SIALKOT	t	2026-07-29 09:18:08.082	2026-08-01 08:22:27.524
a624fe74-2807-4e58-8317-2785f929b40c	00389	SAMOTE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.084	2026-08-01 08:22:27.529
8725cc59-6773-47de-8bc9-c71ac6c81544	00780	SAMROR (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.086	2026-08-01 08:22:27.531
21574a47-22fc-4210-badd-bf2510d7e674	01244	SAMUNDRI	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SAMUNDRI	t	2026-07-29 09:18:08.087	2026-08-01 08:22:27.533
f0cb9948-8661-4a02-b160-e80f933c261f	00751	SANAWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:08.089	2026-08-01 08:22:27.536
a0fbd799-6c1e-4bc9-b09c-59718a62ed72	01428	SANDHIANWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:08.091	2026-08-01 08:22:27.538
c0fafcd9-f68e-4ec6-8837-8cb9c23788c0	00028	SANDU GALI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.093	2026-08-01 08:22:27.54
630087a9-c200-43c8-a1eb-6119dfab5aa7	00235	SANG KALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.095	2026-08-01 08:22:27.542
633c611e-eb2e-4d71-95bd-e9d50f6fe98d	00390	SANGH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.097	2026-08-01 08:22:27.545
609b3af4-f882-4524-8f37-02ae3303253a	01090	SANGHAR	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	NAWAB SHAH	t	2026-07-29 09:18:08.099	2026-08-01 08:22:27.547
84b88429-01eb-4979-bedf-4de99b41512c	02507	SANGHI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.101	2026-08-01 08:22:27.55
521f59b9-392e-4372-a22b-ff644c17572f	00586	SANGHOI SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:08.102	2026-08-01 08:22:27.552
500629ba-faf5-4de5-8cf0-68c5a03df647	00325	SANGLA HILL	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	FAISALABAD	t	2026-07-29 09:18:08.104	2026-08-01 08:22:27.554
7f8e2367-3731-433e-951b-840c7412bc65	01234	SANJARPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SADIQABAD	t	2026-07-29 09:18:08.105	2026-08-01 08:22:27.557
56f7b564-9d8a-4e6f-ae8b-f985f6918654	00064	SANJWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.107	2026-08-01 08:22:27.56
6b6f5c84-dcd4-4982-83ae-9ca7a344078c	00587	SARAI ALAMGIR	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	JHELUM	t	2026-07-29 09:18:08.111	2026-08-01 08:22:27.564
819b425a-02f5-45e5-a627-a3e4ff750ea4	00236	SARAI CHOWK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.113	2026-08-01 08:22:27.566
73dd5e93-4de7-4f45-87a9-06960af1fe5a	00468	SARAI GADAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.115	2026-08-01 08:22:27.568
30317344-95a0-4ebf-9c4b-f4b8b5f03747	00116	SARAI GAMBELA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:08.117	2026-08-01 08:22:27.57
ce14fddb-e428-4e0e-951e-e7458d04a643	00152	SARAI MAHAJER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:08.118	2026-08-01 08:22:27.572
dbc02dd8-cf0e-4ae1-81b5-1cb898d32509	00117	SARAI NAURANG	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BANNU	t	2026-07-29 09:18:08.12	2026-08-01 08:22:27.575
74bc9d70-fe94-4283-9c6b-c5260c071277	00469	SARAI NAYMAT KH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.121	2026-08-01 08:22:27.579
fb10495b-c601-4405-946e-ee9cd04f3e85	00470	SARAI SALAH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.123	2026-08-01 08:22:27.582
972d2e16-4cb8-4717-9cbd-da72f72655d8	00937	SARAI SIDHU	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:08.125	2026-08-01 08:22:27.583
fb55b1dc-3ad7-420b-807e-9f5b593a7ab6	00279	SARANDA (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:08.127	2026-08-01 08:22:27.585
38c875d1-c2ff-4598-b261-829071ba312c	02642	SARDARGARH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAN PUR	t	2026-07-29 09:18:08.129	2026-08-01 08:22:27.586
ca102f59-2f79-4e21-95ab-ff2015757591	00693	SARDARPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:08.131	2026-08-01 08:22:27.588
62e49327-89e8-4da2-b776-97138029b0ab	00916	SARDHERI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.132	2026-08-01 08:22:27.59
a4cf41cd-9431-4166-af2e-6c51a1776ea6	01260	SARGODHA	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SARGODHA	t	2026-07-29 09:18:08.134	2026-08-01 08:22:27.591
8bab9cb6-11b4-4d00-b45d-4201cab5ef9f	00237	SARKALAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.135	2026-08-01 08:22:27.594
7cee85df-755b-4346-808a-3df1eac0bbf6	00743	SARO ZAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:08.137	2026-08-01 08:22:27.613
24870e55-b789-4bdc-bcbe-e2f05acba123	00445	SAROKI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:08.139	2026-08-01 08:22:27.616
63ad79ed-c69a-490b-95ff-718d8b77d2bb	01065	SARRAN (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:08.141	2026-08-01 08:22:27.617
3165b2e9-0ae8-42d5-8044-d24c0957b973	00781	SARSAWA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.143	2026-08-01 08:22:27.619
ce0f510b-f2d4-424b-baec-c234e18e916f	00065	SARWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.145	2026-08-01 08:22:27.621
3ea9babc-c02c-4e3d-814d-3d95bde57e82	00106	SATIYANA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:08.147	2026-08-01 08:22:27.623
e87eb1f6-ec63-4143-b4bd-b58fec54c5b0	00503	SATTRAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.148	2026-08-01 08:22:27.625
b9b5530d-42c4-42c1-ada6-f9f90391accc	00917	SAWAL DIR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.15	2026-08-01 08:22:27.628
6d2bc080-6b9b-499f-aa81-2e198f52b363	00176	SAWARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:08.152	2026-08-01 08:22:27.63
41d56867-d11d-4d36-9a1e-ba919d61e4be	01726	SCASER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:08.154	2026-08-01 08:22:27.632
bab1582c-3242-4fe6-9827-2518279cfe95	01098	SAKRAND	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	NAWAB SHAH	t	2026-07-29 09:18:08.067	2026-08-01 08:22:27.501
b3ab495e-88a2-46a8-be1c-9316e3992571	00783	SEHNSA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.161	2026-08-01 08:22:27.645
308260f1-93f5-4b2c-9c00-f161c64c4643	00262	SEHWAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	DADU	t	2026-07-29 09:18:08.162	2026-08-01 08:22:27.647
052440f5-0db3-449b-91fa-645897151152	00484	SEKKHAT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:08.164	2026-08-01 08:22:27.649
5f212f31-05c9-4ca1-a68c-c25b9252c906	01358	SETHARJA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.166	2026-08-01 08:22:27.651
255f7771-b5a8-4134-ab73-aa6a914559b4	01143	SHABQADAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	PESHAWAR	t	2026-07-29 09:18:08.168	2026-08-01 08:22:27.653
28f0184f-f040-4263-bccb-cc7939d5af70	00485	SHADADPUR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:08.169	2026-08-01 08:22:27.654
a250fb86-311b-469f-9db2-803579ce3538	00066	SHADI KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.171	2026-08-01 08:22:27.656
e5b658be-5948-4aa7-a497-70997380f392	00446	SHADIWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:08.173	2026-08-01 08:22:27.659
05e9c631-a40c-4d85-a324-ba879e82d1c3	02632	SHADUN LUND	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:08.175	2026-08-01 08:22:27.662
52aa9c28-fd9b-4d60-a2ea-653cbc3c8062	00391	SHAH BAGH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.177	2026-08-01 08:22:27.664
c7b2e497-c6d9-4f36-851a-734398bd6e6e	00067	SHAH DHER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.179	2026-08-01 08:22:27.666
47888a05-9112-45d2-b3a2-f8ce243a2454	01080	SHAH JAMAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:08.181	2026-08-01 08:22:27.667
bb8471cb-8133-40e9-b679-89b812e2ef12	00471	SHAH MUHAMMAD	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.183	2026-08-01 08:22:27.669
680b87e4-e7c6-49d1-b539-8a623be9efa3	01099	SHAH PUR CHAKAR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:08.185	2026-08-01 08:22:27.671
0e6874ab-58b0-429d-a3ac-1f6880996099	00918	SHAHBAZ GARHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.186	2026-08-01 08:22:27.672
fa681cb2-f6fb-4cd7-9cf6-b282b7e33850	00318	SHAHBAZ KHAIL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:08.188	2026-08-01 08:22:27.674
cb52742f-e35f-49af-a227-1b000a812ab5	00835	SHAHDADKOT	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	LARKANA	t	2026-07-29 09:18:08.19	2026-08-01 08:22:27.676
3e33ca9c-be03-49c4-b50e-1405af58ea13	00810	SHAHDARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:08.192	2026-08-01 08:22:27.682
88e66995-b0e3-4bde-89d8-5c255c881d83	00098	SHAHEED CHOWK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:08.195	2026-08-01 08:22:27.684
1967861f-bd9a-4862-bba7-00c2d71a6fed	01303	SHAHKOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:08.197	2026-08-01 08:22:27.686
7b724cf4-7408-40a0-bd18-e0b95a0e09e8	00530	SHAHPUR CITY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.198	2026-08-01 08:22:27.689
f0e12804-c29b-421a-812e-42cab2ed3d93	00531	SHAHPUR SADDAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.2	2026-08-01 08:22:27.691
c79051b1-74a5-4a6f-9ff4-1e2a812fb5ae	00540	SHAIDU	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	JEHANGIRA	t	2026-07-29 09:18:08.202	2026-08-01 08:22:27.695
3fc03242-f50d-43ee-9dac-cca793afea02	00588	SHAK RELA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:08.204	2026-08-01 08:22:27.698
7e0689b9-7ce2-48f0-9cfc-6ed05b3f6afd	01087	SHAKAR GARH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:08.205	2026-08-01 08:22:27.702
c3f18f84-da09-453f-8f2e-102c49577ae4	00068	SHAKER DARA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.207	2026-08-01 08:22:27.704
12b54851-1e42-4922-bcdf-711c41207957	00694	SHAMKOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:08.21	2026-08-01 08:22:27.705
1f7ec9a8-088d-4a6f-b6ff-24a21eafa147	00069	SHAMS ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.212	2026-08-01 08:22:27.707
9e1712d6-ae1f-4183-af87-74e886275c22	04114	SHANGLA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHANGLA	t	2026-07-29 09:18:08.214	2026-08-01 08:22:27.709
f4c89503-0c07-4d2a-8d78-4e5921071e7c	04113	SHANGLA ALPURI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHANGLA ALPURI	t	2026-07-29 09:18:08.216	2026-08-01 08:22:27.712
f76465f9-b0d7-4b49-be5a-a21146fa5d99	00898	SHANKIARI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:08.217	2026-08-01 08:22:27.716
30c8614c-4d41-4dae-bc89-7a59463780e9	00695	SHANTINAGAR	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:08.219	2026-08-01 08:22:27.72
cf98d374-7c55-4659-9b73-f840547b310f	01304	SHARAQPUR SHARI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:08.221	2026-08-01 08:22:27.721
8ffcb289-7436-4648-a56e-ac4cb21d517e	00070	SHEEN BAGH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.223	2026-08-01 08:22:27.723
2ff9f6d5-b305-4edf-b810-8a53bb2a8570	01280	SHEIKHUPURA	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SHEIKHUPURA	t	2026-07-29 09:18:08.224	2026-08-01 08:22:27.725
e72f90b4-73e5-4c33-b893-680e910f0344	00029	SHEK-UL-BANDI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.227	2026-08-01 08:22:27.727
c7ecb582-02a5-4c5e-9ccf-3ed7c6ff3a0c	01412	SHER KHANIE	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:08.229	2026-08-01 08:22:27.73
1ecc42ef-e501-44a3-a61a-7fa290e447fb	01684	SHER SHAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MULTAN	t	2026-07-29 09:18:08.231	2026-08-01 08:22:27.75
9b17bc9c-4f43-4821-91f1-090dd5e725b8	01081	SHER SULTAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:08.232	2026-08-01 08:22:27.752
1b2eacbc-ab9b-4ffa-9da3-5399fce4fd04	00899	SHERGARH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:08.234	2026-08-01 08:22:27.754
078e0760-53c3-463f-b9f1-411884f59a24	00919	SHEWA ADDA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.238	2026-08-01 08:22:27.758
8ab17431-f56e-4327-9ebe-50fe5f0de72c	01325	SHIKARPUR	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SUKKUR	t	2026-07-29 09:18:08.239	2026-08-01 08:22:27.764
d5a5d5ab-d554-4970-83fe-bf290758c325	00031	SHIMLA HILL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.242	2026-08-01 08:22:27.767
4ebaa636-8581-4871-8a46-1346e6d06c93	00071	SHINKA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.244	2026-08-01 08:22:27.769
2a6db1a3-44e4-4877-9015-b4882571a2bd	01429	SHORKOT CANTT.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:08.247	2026-08-01 08:22:27.771
b2d1e2e8-1f70-4a9f-b4c5-b295efb91ae4	01430	SHORKOT CITY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:08.248	2026-08-01 08:22:27.773
6d0ad8db-b431-431c-a44f-a9d477dfd285	01066	SHOUKAT LINES	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:08.25	2026-08-01 08:22:27.775
b11c1820-1b46-4605-9585-c85b8bcc6d67	01039	SEHER BAGLA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:08.159	2026-08-01 08:22:27.642
3a3e9861-5b36-442b-b262-80ff5c53532f	01278	SIAL SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:08.256	2026-08-01 08:22:27.785
4cb5812f-e4f2-4b9e-82ec-d4e6970247cc	01309	SIALKOT	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	SIALKOT	t	2026-07-29 09:18:08.258	2026-08-01 08:22:27.786
958bcca5-0388-4176-9673-e479c6ccf02b	01359	SIBBI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.26	2026-08-01 08:22:27.788
b602de78-4153-4f9d-ac30-f41c60fbe6c8	01225	SIHALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:08.262	2026-08-01 08:22:27.79
5288fce3-f888-4f85-aed2-4d16b7df5261	00958	SIKANDARABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:08.264	2026-08-01 08:22:27.791
9b5ec613-c558-45a0-9c51-64a61faab3ed	01279	SILLANWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:08.266	2026-08-01 08:22:27.794
e66ee2d2-bede-4c58-80f1-e623722bfe3b	01197	SINGOLA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:08.268	2026-08-01 08:22:27.797
097e592b-b482-4473-8a30-71cfee10f586	00836	SINJHORO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:08.27	2026-08-01 08:22:27.8
b369ad32-05cb-4081-8451-92dc8afa00f1	00392	SIR SUBA SHAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.272	2026-08-01 08:22:27.802
19c6dde9-1667-49f4-8dfb-ab6c6db1b560	00238	SIRGUDHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.273	2026-08-01 08:22:27.803
58788064-eca0-486b-9be0-2fda7e99cd29	00263	SITA ROAD(REHMA	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	DADU	t	2026-07-29 09:18:08.275	2026-08-01 08:22:27.805
ff018337-4848-44b4-9ed3-b7a681ec45cd	01323	SKARDU	Gilgit-Baltistan	4740d071-cb15-43e2-a5cb-339f17016116	SKARDU	t	2026-07-29 09:18:08.278	2026-08-01 08:22:27.807
f018da82-2dec-4e72-92e1-6595d090fee6	00168	SMAHNI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:08.28	2026-08-01 08:22:27.808
782a93a1-9163-493d-b66f-e8f639125519	00290	SMALL IND ESTAT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:08.282	2026-08-01 08:22:27.815
61a2c4be-50c5-4862-9b33-36a6f6d13f3c	02604	SOBHO DERO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAN PUR	t	2026-07-29 09:18:08.284	2026-08-01 08:22:27.818
cdd69641-e5b0-4568-9b24-15b670673629	00291	SOHAWA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:08.286	2026-08-01 08:22:27.819
10dd0310-d45c-4824-9714-1c042080cf5e	00589	SOHAWA (CITY ON	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:08.287	2026-08-01 08:22:27.821
5a03f153-e984-4b43-8bfe-b00245258bf0	00877	SOHAWA BOLANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:08.289	2026-08-01 08:22:27.823
f5b74878-aefa-4338-b2f9-85ba3ee567d2	00239	SOHAWA DEWALIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.291	2026-08-01 08:22:27.824
6a01de6f-d263-48a1-be88-ec979f93577d	02637	SOHBATPUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAHIWAL	t	2026-07-29 09:18:08.293	2026-08-01 08:22:27.829
d2459a73-b537-49ba-95d0-104b15db2919	01464	SOHDRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:08.295	2026-08-01 08:22:27.832
7921d610-0c79-4294-ab72-dab0d951ac2e	00959	SOHRABWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:08.297	2026-08-01 08:22:27.834
27c419be-9677-4e6e-a0ed-5f60905dcd6f	00167	SOKASAN (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	BHIMBER	t	2026-07-29 09:18:08.298	2026-08-01 08:22:27.835
dd986b51-55b7-44d0-b4b4-dd17ba8f1d0a	00784	SROHTA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.301	2026-08-01 08:22:27.837
f827ad11-877a-4ec9-9959-4ff77194a509	00292	STN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DASKA	t	2026-07-29 09:18:08.302	2026-08-01 08:22:27.839
556adf09-ae4a-4631-a617-e25c18f41608	01235	SUI	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	SADIQABAD	t	2026-07-29 09:18:08.304	2026-08-01 08:22:27.841
cf993988-66bb-4479-be98-edd30f769d70	00393	SUI CHEMIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.306	2026-08-01 08:22:27.842
6aadc828-fa7f-4f20-9400-53bf42bfa60c	01423	SUJAWAL	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	THATTA	t	2026-07-29 09:18:08.308	2026-08-01 08:22:27.846
943a56ef-bddd-4f3c-8f91-ced43de2b138	01326	SUKKUR	Sindh	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	SUKKUR	t	2026-07-29 09:18:08.312	2026-08-01 08:22:27.851
2575d464-8dc6-4bb1-8b86-b417a911bcb7	01360	SULTAN KOT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.314	2026-08-01 08:22:27.853
dcfb176f-94a2-4c04-863a-49ec82e22ca3	00472	SULTAN PUR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.316	2026-08-01 08:22:27.854
3cedb643-2c9a-47ca-a49b-ecb045132ee9	00395	SUMBAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.318	2026-08-01 08:22:27.856
566f66f8-563a-4d05-aca6-7954fbba436b	00139	SUNDER ADDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAI PHERU	t	2026-07-29 09:18:08.32	2026-08-01 08:22:27.858
f4bcf39c-c21c-49e5-8811-d90f3ed957e8	01040	SUNNY BANK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:08.322	2026-08-01 08:22:27.862
143f5129-4dfc-4900-af53-93cf1d642a6a	00785	SUPPLY (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.323	2026-08-01 08:22:27.864
f0400803-ede0-441d-bf7b-fd538dfcdc0c	00396	SUSRAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.326	2026-08-01 08:22:27.866
44dbb87e-57a9-498b-b7bb-569373c8a0b5	01364	SWABI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:08.328	2026-08-01 08:22:27.868
331d6023-4b82-409a-be4d-8d511b538b06	01226	SWAN CAMP	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:08.33	2026-08-01 08:22:27.872
86217890-7e1d-443e-884f-1a4a50b564bc	00397	SYED KASSRAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.332	2026-08-01 08:22:27.873
4127289f-2bd1-4a39-a3d7-5af44564485e	00107	SYED WALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:08.334	2026-08-01 08:22:27.883
040c7c17-9865-43be-bdf5-b922c33cf43a	00473	T-TIP  COLONY	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.335	2026-08-01 08:22:27.885
0549dfa0-75c8-48f5-bc5a-85689539c285	04027	TAFTAN	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:08.337	2026-08-01 08:22:27.887
9b47120d-237a-4031-b918-74605fc1dcb6	00852	TAIL INDUS	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAYYAH	t	2026-07-29 09:18:08.339	2026-08-01 08:22:27.889
19a5010b-6d77-46cb-82a2-9749c5e3a2c1	00032	TAKHIA SHEIKHIN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.341	2026-08-01 08:22:27.89
74e140c3-4864-4afa-8176-fe541facb790	00669	TAKHT NASARTI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KARK	t	2026-07-29 09:18:08.343	2026-08-01 08:22:27.892
c9cc761f-b761-4d39-b376-baa9cb30f059	01376	TAKHT-E- BHAI	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	TAKHT-E- BHAI	t	2026-07-29 09:18:08.345	2026-08-01 08:22:27.895
fc639ebe-30b9-4097-96f0-55b5fef6c767	00033	TAKIA HALL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.347	2026-08-01 08:22:27.899
6f40bb31-49b0-4c80-9e52-79bbfa1535ed	00786	TAKYA KAWAN(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.349	2026-08-01 08:22:27.901
7aa18a17-08ba-4262-afb6-29c1537b4cc6	01730	SIAL MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRAT	t	2026-07-29 09:18:08.254	2026-08-01 08:22:27.783
f1494eac-dce8-49e2-a438-ace04496932a	00079	TALHAR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	BADIN	t	2026-07-29 09:18:08.354	2026-08-01 08:22:27.907
c04c34b4-bd36-43fe-941b-24c12304b693	00787	TALIAN (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.356	2026-08-01 08:22:27.916
b3d666ed-53d8-4a60-9b2f-653826d4fc80	00590	TALIANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:08.358	2026-08-01 08:22:27.923
005bc2e3-b763-45ed-995e-eb894ad18173	01144	TALL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	PESHAWAR	t	2026-07-29 09:18:08.36	2026-08-01 08:22:27.924
bb6d5573-620a-45f3-83f6-3b3da6acf1fa	00474	TALUKAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:08.362	2026-08-01 08:22:27.927
1c0572a7-a341-4fe6-9d07-4956512a79cc	01138	TALVANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:08.365	2026-08-01 08:22:27.929
375dd6f6-a763-41ba-9a5a-78ee5d5b97f9	01465	TALWARRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:08.367	2026-08-01 08:22:27.933
66afa100-bbfb-40b8-8e08-55d90dd5077b	01399	TAMIRGARAHA	Khyber Pakhtunkhwa	58dae26b-44d2-43ac-9424-1a7926196e32	TAMIRGARAHA	t	2026-07-29 09:18:08.368	2026-08-01 08:22:27.934
cc246154-a2c2-46d6-ae57-5ed385804dad	01396	TAMMAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:08.37	2026-08-01 08:22:27.936
b2d25af0-40b1-44c1-9298-64d7388dfdfd	01372	TAND KOI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:08.372	2026-08-01 08:22:27.937
73e4f5b1-3a8c-4cd5-9afa-612e61fd4ad0	00498	TANDA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:08.374	2026-08-01 08:22:27.939
89c260c4-eef4-4c6f-a661-506a840b0aa2	01258	TANDLIANWALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:08.376	2026-08-01 08:22:27.94
7f610ded-6f42-4090-9388-6a08f51982d2	00476	TANDO ADAM	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	HYDERABAD	t	2026-07-29 09:18:08.379	2026-08-01 08:22:27.942
6f90f02e-f865-4855-ac57-07ca926a9c56	01415	TANDO ALLAH YAR	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	TANDO ALLAH YAR	t	2026-07-29 09:18:08.38	2026-08-01 08:22:27.944
14d71580-7190-4a07-8a80-11ed91b838c9	00080	TANDO BAGO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	BADIN	t	2026-07-29 09:18:08.382	2026-08-01 08:22:27.947
72f574fb-4ea6-45d1-ae81-ed08317fba12	00081	TANDO GHULAM AL	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	BADIN	t	2026-07-29 09:18:08.384	2026-08-01 08:22:27.95
51f9047f-ecd3-4154-940b-70490ed18f9e	01416	TANDO JAM	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	TANDO ALLAH YAR	t	2026-07-29 09:18:08.386	2026-08-01 08:22:27.951
9b7c522c-31de-42dd-bd9b-b704a786719d	01001	TANDO JAN MOHD.	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:08.387	2026-08-01 08:22:27.953
bab949fa-c282-44fa-9acc-f739949cb810	00082	TANDO MOHD.KHAN	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BADIN	t	2026-07-29 09:18:08.389	2026-08-01 08:22:27.954
5e5f1b93-b293-4e3f-be05-db7dc539b348	04008	TANDO SOOMRO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:08.391	2026-08-01 08:22:27.956
d30bc826-fb99-484f-af4d-f1223ee70ecd	00280	TANGDEW (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:08.394	2026-08-01 08:22:27.957
3d228cac-39b6-4e65-9c15-4de28d5e76ae	00920	TANGI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.396	2026-08-01 08:22:27.959
bcd20b30-205c-43fc-931a-5f595ca9cbee	01198	TANGI GALA  (A.	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:08.398	2026-08-01 08:22:27.962
e965cf9e-2f5b-4180-82d7-6b11565b940b	02607	TANGWANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAN PUR	t	2026-07-29 09:18:08.399	2026-08-01 08:22:27.965
2219de06-06ff-4e50-a732-daafc85e7bae	00319	TANK	Khyber Pakhtunkhwa	58dae26b-44d2-43ac-9424-1a7926196e32	DERA ISMAIL KHA	t	2026-07-29 09:18:08.401	2026-08-01 08:22:27.969
2771e3b6-8949-40c7-8f35-5c1acd8b8c75	00744	TAPPI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:08.403	2026-08-01 08:22:27.971
aef7cf1e-342b-47cb-9703-10c3434904cd	00072	TARBELA DAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.405	2026-08-01 08:22:27.973
cc6dfd81-9acd-4267-8a19-94c605b24e17	00986	TARIQ ABAD (A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:08.407	2026-08-01 08:22:27.975
b103e644-bf98-423c-ae54-5c0efa7f31b7	01115	TARNAB FARM(AGR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:08.409	2026-08-01 08:22:27.978
2a94e2b0-3ce6-4e33-ae8c-322c80eb15cb	01227	TARNOL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:08.411	2026-08-01 08:22:27.979
5e7c81ec-3123-4cea-aa89-f90a369f7b7b	01116	TARU JABBA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:08.413	2026-08-01 08:22:27.983
8ed2bbab-0ff5-4764-89fa-367c387b3d19	00788	TATA PANI (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.415	2026-08-01 08:22:27.986
67c16155-90e2-452e-998b-9c97613a8575	00320	TATAR KHAIL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:08.417	2026-08-01 08:22:27.987
6dabbfd9-90eb-4315-a33b-4235cfba8ad4	00422	TATLE AALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.419	2026-08-01 08:22:28
ae8bbdb2-b826-4eb4-9bab-57a042a84d38	00240	TATRAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.421	2026-08-01 08:22:28.002
837a1eb0-15de-433d-8235-948ae49aa32a	00752	TAUNSA SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:08.422	2026-08-01 08:22:28.004
2370e7ce-c4a6-47c9-95ba-076abfb6021f	01449	TAXILA	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	WAH CANTT.	t	2026-07-29 09:18:08.424	2026-08-01 08:22:28.006
8bf9cf22-cee3-42aa-a60b-29e2d91cd3a1	01397	TEHI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:08.426	2026-08-01 08:22:28.007
1c340c6d-d085-459f-91d4-d6c8fa6c2479	01041	TERMUTHIAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:08.428	2026-08-01 08:22:28.01
0069345f-d4fd-42c5-b2e1-474a2f1601c4	02619	THAING MORE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:08.43	2026-08-01 08:22:28.012
44596689-5537-427e-9877-655ee56ca359	01442	THAINGI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:08.432	2026-08-01 08:22:28.016
95fea99f-ecbe-4351-bbc7-7acde09ff970	00745	THALL	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:08.433	2026-08-01 08:22:28.018
172c4c0a-9540-4417-98a9-6a21413457ad	00034	THANDA CHOHA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.437	2026-08-01 08:22:28.021
371a9fe3-d32e-47d3-a187-828c1bc8285d	00241	THANIL FATOI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.439	2026-08-01 08:22:28.023
ea40077d-6c60-4104-9717-c64ed3a71809	00242	THANIL KAMAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.441	2026-08-01 08:22:28.024
bb4f2237-dd9b-4101-92f8-63639b2b6f01	01002	THARPARKER	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:08.443	2026-08-01 08:22:28.027
6d6cd12f-f113-40d9-95e7-07f019e6b9b8	01123	THARU SHAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERO FEROZ	t	2026-07-29 09:18:08.445	2026-08-01 08:22:28.031
c6462a02-d201-45e8-b107-6c1f61ec0c30	01384	TALAGANG	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	TALAGANG	t	2026-07-29 09:18:08.351	2026-08-01 08:22:27.903
c47031a0-858f-43ef-af2f-695449d4a4e8	01417	THATTA	Sindh	ee2726a8-1562-48a2-a5a8-9daa99729f7a	THATTA	t	2026-07-29 09:18:08.45	2026-08-01 08:22:28.038
57e73b6b-7412-44b6-9c77-59986d2a1c6e	00696	THATTA (SADIQAB	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANEWAL	t	2026-07-29 09:18:08.452	2026-08-01 08:22:28.039
68c336f4-a9a7-4776-8498-1dda8265ac66	01139	THEENG MORE(ALL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:08.453	2026-08-01 08:22:28.047
94603e64-a3e4-4cfc-88d1-754ff746e08a	01361	THEHRI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.455	2026-08-01 08:22:28.051
60a1f794-177d-47d1-abc0-d86d6db69501	00681	THERI MIR WAH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHAIR PUR MEERU	t	2026-07-29 09:18:08.457	2026-08-01 08:22:28.053
b8ce2954-547a-4e2c-a638-1f2321188d17	01398	THOA MAHARAM KH	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TALAGANG	t	2026-07-29 09:18:08.46	2026-08-01 08:22:28.055
a17e24e4-6899-4064-a9eb-e0f369ee4f1a	01199	THORAR (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:08.462	2026-08-01 08:22:28.056
68a60f21-b139-4fbc-ac9a-391c9fe677aa	00721	THOTHA RAI BAHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:08.464	2026-08-01 08:22:28.058
34e3d09a-d4e3-4850-9aa6-00991200cba6	01362	THULL	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	SUKKUR	t	2026-07-29 09:18:08.465	2026-08-01 08:22:28.061
d9a4e979-8c29-40c4-ad59-8bd7b27c9fec	01443	TIBBA SULTAN PU	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VEHARI	t	2026-07-29 09:18:08.467	2026-08-01 08:22:28.064
2e9e3747-e448-48b7-be90-1bfa29e5cbd0	02663	TIBBI QIASRANI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:08.469	2026-08-01 08:22:28.067
4dde0048-84ef-4d7d-a570-ac6766853507	01424	TOBA TEK SING	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	TOBA TEK SING	t	2026-07-29 09:18:08.471	2026-08-01 08:22:28.068
d3a82077-068a-4b02-9a7a-3fe41613bfb7	00746	TOGH BALA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:08.472	2026-08-01 08:22:28.07
cb655bc7-524c-4d65-97e6-9810bc6a815e	00243	TOHA BHADAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.475	2026-08-01 08:22:28.072
1729ffea-5c44-4319-8978-a751eca44957	00398	TOHA KHALSA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.477	2026-08-01 08:22:28.074
cdef5c02-28bc-4ff3-891e-97ff7ef7a063	01200	TOPA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:08.479	2026-08-01 08:22:28.075
d4935721-26cf-4eb1-93ae-03ddf87c3d9e	01373	TOPI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:08.481	2026-08-01 08:22:28.078
434ea5bd-80bb-4184-893d-d26405a1468a	01374	TORDHER	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:08.483	2026-08-01 08:22:28.082
cb0ad02a-92c0-4259-bc57-a2457ddecb7a	00177	TOUR WARSAK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BUNNER	t	2026-07-29 09:18:08.484	2026-08-01 08:22:28.085
a02fb855-aa5a-4e35-a738-93a33fc53bfc	00857	TRANDA MOHD. PA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LIAQATPUR	t	2026-07-29 09:18:08.486	2026-08-01 08:22:28.086
e3917195-d731-4d71-9a4a-e656c85027c9	02679	TRANDA SEWAYE KHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAHIM YAR KHAN	t	2026-07-29 09:18:08.488	2026-08-01 08:22:28.088
84689c3f-5f4d-4840-a326-229ae5a54eb8	01201	TRARKHAIL (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:08.49	2026-08-01 08:22:28.09
c4aea720-1958-4dce-baa8-8d96a1a7992f	00960	TRUG	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:08.492	2026-08-01 08:22:28.091
8a318f85-409b-47d0-bb16-352abc580d50	00281	TRUTTA (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:08.494	2026-08-01 08:22:28.094
2b1ea44e-a13c-4807-bffb-26aa55ebb7dc	00938	TULAMBA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:08.496	2026-08-01 08:22:28.096
423bdc64-3c8a-4da6-ba60-ae7544b58b50	00660	TUMP	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:08.498	2026-08-01 08:22:28.099
a859bc4e-443a-48c6-a748-f33ece52a3e2	00596	TURBAT	Sindh	58dae26b-44d2-43ac-9424-1a7926196e32	KARACHI	t	2026-07-29 09:18:08.5	2026-08-01 08:22:28.1
44aebc27-bfe7-4f9f-90c2-aefb3f1a0bfd	01011	UBAURO	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR MATHELO	t	2026-07-29 09:18:08.501	2026-08-01 08:22:28.102
e4363725-446e-47b2-b9b2-0b035c6a3daa	01259	UBL 228 G.B	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SAMUNDRI	t	2026-07-29 09:18:08.503	2026-08-01 08:22:28.104
df608c27-80f7-4af6-8a65-54ebcb892dad	01432	UBL 351 G.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:08.507	2026-08-01 08:22:28.107
85067113-88ab-44b0-8aea-ef07348c84f8	00108	UCH SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALPUR	t	2026-07-29 09:18:08.509	2026-08-01 08:22:28.108
2841d661-8e3c-4e81-8cca-8af1fff8189a	00244	UDHERWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.512	2026-08-01 08:22:28.111
4c192800-7af2-45c2-84e0-4b8611096408	01322	UGGOKE	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:08.513	2026-08-01 08:22:28.113
818d1d61-6755-42da-8d58-28f68fdbcb26	02676	UMAR KOT	Punjab	58dae26b-44d2-43ac-9424-1a7926196e32	MUZAFFARGARH	t	2026-07-29 09:18:08.516	2026-08-01 08:22:28.124
5cf52eca-9e08-4f17-a06a-d3bf9d9c4733	00921	UMAR ZAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.518	2026-08-01 08:22:28.127
d3f2ba9a-c216-45fe-b9c0-286e03ed104a	01003	UMER KOT	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR KHAS	t	2026-07-29 09:18:08.52	2026-08-01 08:22:28.13
42f2490f-771b-4900-970e-f604c0625b26	01042	UPPER DAWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MURREE	t	2026-07-29 09:18:08.522	2026-08-01 08:22:28.133
5c85b488-523c-4743-b03f-e16335566cd0	01363	USTA MUHAMMAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:08.524	2026-08-01 08:22:28.134
46095ad5-aad6-42b4-a453-dcd3357e6a30	00601	UTHAL	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:08.526	2026-08-01 08:22:28.136
5b78a2e2-0e4e-4ecf-a13f-dcf036234bd6	00922	UTMAN ZAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:08.528	2026-08-01 08:22:28.138
a95cdee9-c653-4d04-9881-5fce4d882b63	04010	VAAR	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	HYDERABAD	t	2026-07-29 09:18:08.53	2026-08-01 08:22:28.139
dfe4c47e-c5e2-4cc8-999a-f723ab1216c4	01707	VANKE TARR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.532	2026-08-01 08:22:28.141
04516d23-da94-412c-81ff-dd74e5d27394	00423	VANKY TARER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.534	2026-08-01 08:22:28.143
dc4b6ea4-c764-4651-acb9-e7cc0967a583	00532	VEGOWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.536	2026-08-01 08:22:28.149
2ceca4b2-6e34-44d3-9be6-0203b9b8df01	00245	VEHALIZER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.537	2026-08-01 08:22:28.153
79b27ff8-525c-417d-8f04-18fd1b2f7fa8	01434	VEHARI	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	VEHARI	t	2026-07-29 09:18:08.539	2026-08-01 08:22:28.154
a416823c-d519-4b41-b4a1-e186eb06792d	01714	VENKE TARAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	VENKE TARAR	t	2026-07-29 09:18:08.541	2026-08-01 08:22:28.156
9aead8a3-909f-4e26-8332-d3631d6fcee5	00424	VENKTARAR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.543	2026-08-01 08:22:28.158
e36410fc-a8cb-4ba0-a049-dcb1f5eef1f2	00591	THATI GUJRAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHELUM	t	2026-07-29 09:18:08.448	2026-08-01 08:22:28.036
18610dbb-2c7c-4970-8d7f-d4266c59a79e	00246	VILLAGE SOHAWA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.549	2026-08-01 08:22:28.165
49053674-cf6a-4dba-9ccf-6a81920e9f91	00753	VOHOVA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KOT ADDU	t	2026-07-29 09:18:08.551	2026-08-01 08:22:28.167
09374760-ded0-4a42-b52a-4254ca117a14	01716	WADALA SINDHOAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.553	2026-08-01 08:22:28.168
dda3d7e8-c6ee-4c8c-b9bd-4bc0fe0aa333	00533	WADHI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.554	2026-08-01 08:22:28.171
24a8bbac-ec31-4d17-8569-d084b2385ff8	00837	WAGGON	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:08.556	2026-08-01 08:22:28.172
9c0054ae-631d-4d61-a8b4-d48b67c841e4	01444	WAH CANTT.	Punjab	09c212e9-7926-4cb7-aac4-6be051ef9e3d	WAH CANTT.	t	2026-07-29 09:18:08.558	2026-08-01 08:22:28.174
56f4db47-f227-4afa-b29d-ae6ca085bd2b	00504	WAHHNDO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.561	2026-08-01 08:22:28.177
546860c5-023c-43ba-8525-6dd06fdd3b7d	00247	WAHULA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:08.563	2026-08-01 08:22:28.179
ef041999-0365-4b45-80d6-03ec002fe1e8	00073	WAISA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	ATTOCK	t	2026-07-29 09:18:08.564	2026-08-01 08:22:28.181
62270e3a-d6b5-4f8e-bc4f-4b792e65a94a	01720	WAN RADHA RAM	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PATTOKI	t	2026-07-29 09:18:08.566	2026-08-01 08:22:28.183
83138028-73f5-4ad3-942d-ed0bbbbdafd1	00321	WANA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:08.568	2026-08-01 08:22:28.185
052ca16a-069c-43f3-90ed-344138c50783	00961	WANBHOCHRAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:08.57	2026-08-01 08:22:28.186
f320184f-932f-4fc5-8e04-213d3f14d24e	00838	WARAH	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	LARKANA	t	2026-07-29 09:18:08.571	2026-08-01 08:22:28.189
bbb6c98e-b270-4ed4-bca0-982458c014e1	01305	WARBATTAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SHEIKHUPURA	t	2026-07-29 09:18:08.573	2026-08-01 08:22:28.192
ae54b961-6523-46ca-8e01-2fa7ff9988d2	00534	WARCHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.575	2026-08-01 08:22:28.195
0b6338a8-2456-4ce0-aa05-a6b40dbc008f	01414	WARI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:08.578	2026-08-01 08:22:28.198
e26a0de5-0cdf-46b9-8500-3e75e516d4c3	00425	WARPAL CHATTHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:08.58	2026-08-01 08:22:28.2
7da092af-5859-448f-853d-1ed04351e422	04043	WARSUK	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:08.581	2026-08-01 08:22:28.24
c7e8ce06-2d3f-4deb-8e1c-8245b30e3e12	00878	WASU	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MANDI BAHAUDDIN	t	2026-07-29 09:18:08.583	2026-08-01 08:22:28.248
1c7d8963-1aac-4b87-a070-cf68aafba089	00962	WATAKHEL CITY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:08.585	2026-08-01 08:22:28.251
d39bd66c-7eb5-42e0-8794-b2bb32f6665f	01450	WAZIRABAD	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	WAZIRABAD	t	2026-07-29 09:18:08.587	2026-08-01 08:22:28.255
206e9298-eb67-4e70-8f7f-fe9aacdf3588	00602	WINDER	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	KARACHI	t	2026-07-29 09:18:08.588	2026-08-01 08:22:28.259
5bfba664-7613-4ef2-bb1e-c70b60634aa5	02658	YARO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:08.59	2026-08-01 08:22:28.263
c9f7a32c-0f79-4a92-a97a-f70c8c609adf	00963	YAROKHEL CITY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:08.593	2026-08-01 08:22:28.266
9d5a964c-5c2c-42bb-8b91-7334e5372fc7	00535	YOUSAF SUGAR MI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JAUHRABAD	t	2026-07-29 09:18:08.596	2026-08-01 08:22:28.272
e8f777b1-07a2-4000-9c5d-7f2ec2ddaed0	01088	ZAFARWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	NAROWAL	t	2026-07-29 09:18:08.598	2026-08-01 08:22:28.277
788c3b98-bf72-46e7-b5eb-407029abef7f	00701	ZAHIR PEER	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHANPUR	t	2026-07-29 09:18:08.6	2026-08-01 08:22:28.282
cc68dc63-bcb5-4638-a9bb-99bf417da623	01375	ZAIDA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	SWABI	t	2026-07-29 09:18:08.602	2026-08-01 08:22:28.286
8f2d7ad9-2815-4061-bb1b-d2a8de57825c	01160	ZHOB	Balochistan	4740d071-cb15-43e2-a5cb-339f17016116	QUETTA	t	2026-07-29 09:18:08.604	2026-08-01 08:22:28.288
af4a0333-c0da-450f-bb5d-9c9543cd2345	01786	ZIABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	LAHORE	t	2026-07-29 09:18:08.605	2026-08-01 08:22:28.291
eca83c55-a006-4ab1-9520-32412a48a349	04050	LAHORE PRINT SHOP	Punjab	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	LAHORE	t	2026-07-29 09:18:08.608	2026-08-01 08:22:28.294
c7095e1d-480b-4a9a-a09a-995968ef3d65	01310	AADHA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SIALKOT	t	2026-07-29 09:18:05.427	2026-08-01 08:22:17.653
88620469-5079-4149-be64-da8dca186ad8	00537	ADAM ZAI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	JEHANGIRA	t	2026-07-29 09:18:05.452	2026-08-01 08:22:17.681
c178161c-3ebf-4813-9c48-8850509da14c	00121	AMAN DARA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:05.584	2026-08-01 08:22:17.792
befdb225-562d-4f71-83dc-081c6757d167	01103	AMAN GARH	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:05.586	2026-08-01 08:22:17.794
e8d5e9d6-bbb9-4f99-b2b5-37c332ccd707	00756	ANOI SROHTA(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:05.601	2026-08-01 08:22:17.813
5925dfd3-53d3-4343-800a-425c9e52b1ee	00903	BALA GARHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MARDAN	t	2026-07-29 09:18:05.693	2026-08-01 08:22:17.916
4aa8ea2d-f9c4-4702-8184-ffc9c6444a44	00294	BASTI FUJA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	DERA GHAZI KHAN	t	2026-07-29 09:18:05.745	2026-08-01 08:22:17.978
780046d8-4827-4f16-a953-8c97b5652071	00259	BHAN SAEED ABAD	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	DADU	t	2026-07-29 09:18:05.799	2026-08-01 08:22:18.043
a5fa110a-4838-4403-9d74-ae84681e7690	09022	BHEESHAM	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:05.818	2026-08-01 08:22:18.064
0145d1b1-5a12-4538-906d-ef40de61560b	01767	CHAK 10	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	SARGODHA	t	2026-07-29 09:18:05.907	2026-08-01 08:22:18.181
d709aebe-f6fe-4a16-a221-15783c47d6fd	00491	CHAK KALA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JALAL PUR JATTA	t	2026-07-29 09:18:05.953	2026-08-01 08:22:18.252
54e32940-cbdf-46a8-bfaf-b65d695e7631	00901	CHARSADDA	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	MARDAN	t	2026-07-29 09:18:06.014	2026-08-01 08:22:18.371
2eae7ee5-0f06-4ae5-aced-49d63fc38a9b	01050	CHELLA BANDI (A	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.031	2026-08-01 08:22:18.396
5e3f24f3-6eb8-4e12-91ab-83d1df5b15f6	00264	DADYAL (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:06.12	2026-08-01 08:22:18.564
ed38632a-9714-421c-8a55-284180988058	01182	DATOTE (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.18	2026-08-01 08:22:18.642
0d94828a-756d-40e5-bad2-5bebac0ca645	01419	DHABEJI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	THATTA	t	2026-07-29 09:18:06.23	2026-08-01 08:22:18.941
fb026425-683e-43f1-aab6-637ac64c0e69	00709	DHALL GHAIR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:06.234	2026-08-01 08:22:18.945
cd5b87ee-0089-47e2-b4fd-0da9f820efa3	01725	VILAGE BUDHY	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA CANN	t	2026-07-29 09:18:08.547	2026-08-01 08:22:28.162
5295f091-be4b-42ab-b0df-7468fa5af781	01681	DOLTA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	RAWALPINDI	t	2026-07-29 09:18:06.315	2026-08-01 08:22:19.858
78113497-dc3d-4240-911f-83f183187d84	01183	GALA KNATHA	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.4	2026-08-01 08:22:20.993
d1c2aa14-e821-43f6-9170-3266b5f04958	00249	GHAZIABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHICHA WATNI	t	2026-07-29 09:18:06.443	2026-08-01 08:22:21.32
e4e38760-03b4-4cfc-aadc-49bd84ec8276	00308	GOMAL UNIVERSIT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:06.484	2026-08-01 08:22:21.482
e1972a38-4637-4622-a13c-55177ac47cc5	00893	HAJIABAD ICHRIA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MANSEHRA	t	2026-07-29 09:18:06.582	2026-08-01 08:22:22.17
111ede61-59cf-4b95-9592-c761e08e34d9	00452	HATTAR IND. EST	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:06.636	2026-08-01 08:22:22.553
5e2dfdfb-6b97-4979-b606-695a446cb654	01338	HUMYUN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:06.688	2026-08-01 08:22:23.012
ac2c3648-ea0f-48df-8c03-5b5c177b0f19	01058	JALABAD (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.727	2026-08-01 08:22:23.118
3262ea89-3e42-4338-b0ad-6f0bcf75ddfe	00213	JHAMRA	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	CHAKWAL	t	2026-07-29 09:18:06.793	2026-08-01 08:22:23.234
cd803573-20f1-44b0-93e0-d49257d2d8dd	00409	JIBBRAN MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.82	2026-08-01 08:22:23.287
b73b814b-4536-46b6-9bfb-08f69729fd7b	01690	KALEKE MANDI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJRANWALA	t	2026-07-29 09:18:06.898	2026-08-01 08:22:23.545
fe19ca74-fa55-401a-ade7-057045123306	00455	KANGRA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	HARIPUR	t	2026-07-29 09:18:06.939	2026-08-01 08:22:23.62
6ddfe00f-41ea-44fd-9278-bc366073dba1	01187	KHAIGALA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07	2026-08-01 08:22:23.746
f9d8fb97-c8d8-4f22-b399-89228e145adb	04036	KHAN WAHAN	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	NAWAB SHAH	t	2026-07-29 09:18:07.035	2026-08-01 08:22:24.084
190287a2-6595-4938-9d68-6f8923d47ecb	00772	KHURATTA (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.097	2026-08-01 08:22:24.417
b7aa141c-3744-4059-8b07-91959bdac89c	00736	KOHAT INDUSTRIA	Khyber Pakhtunkhwa	ee2726a8-1562-48a2-a5a8-9daa99729f7a	KOHAT	t	2026-07-29 09:18:07.115	2026-08-01 08:22:24.471
babdd276-95ee-440f-be5e-d7fd4a0d3489	00754	KOTLI (A. K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.192	2026-08-01 08:22:24.686
4d433b2b-1ccd-4746-9744-65aace1c2267	00310	KULACHI	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.211	2026-08-01 08:22:24.725
3843c7e6-9303-480b-889c-9d6fd0f520bb	00953	LIAQATABAD(PIPL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:07.287	2026-08-01 08:22:24.884
0cc77529-0487-4d58-8f2e-1ca8b25610eb	01149	LILLA TOWN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	PIND DADAN KHAN	t	2026-07-29 09:18:07.291	2026-08-01 08:22:24.889
10db7ac7-90ab-4697-8104-ad4ca32dc0df	00932	MAKADOOMPUR POK	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIAN CHANNU	t	2026-07-29 09:18:07.337	2026-08-01 08:22:24.986
236a9042-f5a7-439a-91f6-17e1e3b53956	01128	MANDI HEERA SIN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	OKARA	t	2026-07-29 09:18:07.388	2026-08-01 08:22:25.088
6056e232-b491-4c80-954c-75046adb1a8d	00374	MANKYLA STATION	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:07.426	2026-08-01 08:22:25.184
d8f2c3bf-16f6-4324-8ab1-1189b4690acb	00096	MINCHIN ABAD	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:07.485	2026-08-01 08:22:25.305
52a92b66-5350-4903-8c07-b6398c96cb29	00097	MOHAR SHARIF	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BAHAWALNAGAR	t	2026-07-29 09:18:07.532	2026-08-01 08:22:25.415
aed9856b-5bd0-46b1-ab13-b0548fc31cc7	01409	MUNDA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:07.581	2026-08-01 08:22:25.534
1c1fce43-0b91-49e5-88eb-2a200c765421	00774	NAR (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:07.614	2026-08-01 08:22:25.633
27eec5d7-992d-480b-8cf4-d4b8abcdb05e	00718	NOONAWALI	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	KHARIAN	t	2026-07-29 09:18:07.678	2026-08-01 08:22:25.804
2762f144-f082-4b49-b995-75b384628f53	01111	PABBI BAZAR	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	NOWSHERA	t	2026-07-29 09:18:07.739	2026-08-01 08:22:25.889
a19b362c-3295-41d8-8241-b5b370be0a27	00275	PANYAM (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:07.797	2026-08-01 08:22:26.137
1cd84256-3a60-4780-afc6-48c78ff3b61e	00314	PAROVA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	DERA ISMAIL KHA	t	2026-07-29 09:18:07.806	2026-08-01 08:22:26.188
5f971655-2d94-4f9b-be12-30f131e44535	00278	PLAK (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	DADYAL (A. K)	t	2026-07-29 09:18:07.886	2026-08-01 08:22:26.871
a97e8c9e-e405-4377-8e1f-ae6c4db1bd86	01077	QADIRPUR RAWAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:07.921	2026-08-01 08:22:27.188
80b47e26-7901-4575-a0ff-dba1939f6bea	01355	RAKHNI	Sindh	4740d071-cb15-43e2-a5cb-339f17016116	SUKKUR	t	2026-07-29 09:18:07.975	2026-08-01 08:22:27.265
05e0b981-354e-4f51-bb7d-c134e3f215c2	00550	ROODO SULTAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	JHANG	t	2026-07-29 09:18:08.02	2026-08-01 08:22:27.363
def48db7-b19e-4425-a8bd-8155928c594d	01382	SAKHAKOT	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TAKHT-E- BHAI	t	2026-07-29 09:18:08.065	2026-08-01 08:22:27.435
f94b832a-1aab-4669-8b30-1c33c6f9f423	01803	SARA-E- KARISHAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	BHAKKAR	t	2026-07-29 09:18:08.109	2026-08-01 08:22:27.562
7ee20590-acaa-4a7a-9cd0-210142ef3c2b	02639	SEET PUR	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARGARH	t	2026-07-29 09:18:08.155	2026-08-01 08:22:27.634
290cf5d4-24bf-472f-90ef-991ad7dc3ca7	00030	SHERWAN	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	ABBOTABAD	t	2026-07-29 09:18:08.236	2026-08-01 08:22:27.755
2470344d-3269-48a7-a04d-fffa992b487b	01307	SHUJABAD	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	SHUJABAD	t	2026-07-29 09:18:08.252	2026-08-01 08:22:27.778
af6faea6-8ef7-43a5-acd9-f87ee5607fa4	00394	SUKKHO	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:08.31	2026-08-01 08:22:27.849
a6fd7fe1-2191-49d0-82b9-3f6276faa967	01413	TALASH ( ZIARAT	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	TAMIRGARAHA	t	2026-07-29 09:18:08.353	2026-08-01 08:22:27.906
1b2c193d-e965-40df-ac7b-85042ee47af9	00133	THANA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	BATKHELA	t	2026-07-29 09:18:08.435	2026-08-01 08:22:28.019
92a14350-fa00-486d-b2c4-a744892ac572	01466	THATHI ARRAYAN	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	WAZIRABAD	t	2026-07-29 09:18:08.446	2026-08-01 08:22:28.034
497d8f87-a45a-4670-b1ed-9a8edb4a247d	01431	UBL 316 G.B.	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	TOBA TEK SING	t	2026-07-29 09:18:08.505	2026-08-01 08:22:28.105
73019587-8e7b-4441-8f27-49ee55297703	00987	VESPA FACTORY	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MIRPUR (A. K)	t	2026-07-29 09:18:08.545	2026-08-01 08:22:28.16
216eecd7-de2b-47d1-9a37-2314b3f09a66	00109	YAZMAN MANDI	Punjab	ee2726a8-1562-48a2-a5a8-9daa99729f7a	BAHAWALPUR	t	2026-07-29 09:18:08.595	2026-08-01 08:22:28.269
6058a54b-132e-474d-9395-54939c82a4d0	01044	AMBOR AREA	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:05.589	2026-08-01 08:22:17.796
e76a8163-e721-4592-882c-025442e3c986	00350	BHANAIR KASWAL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	GUJAR KHAN	t	2026-07-29 09:18:05.801	2026-08-01 08:22:18.045
412365c1-fb6c-458f-a78d-c861bc090b26	01049	CHATTAR AREA	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	MUZAFFARABAD(AK)	t	2026-07-29 09:18:06.022	2026-08-01 08:22:18.384
515bd90b-8d68-46a0-9e13-c63a2d786183	00945	EASAKHEL	Punjab	4740d071-cb15-43e2-a5cb-339f17016116	MIANWALI	t	2026-07-29 09:18:06.34	2026-08-01 08:22:20.429
f9b71749-4c97-400a-a681-d2a8e6a3a3c0	00486	ISLAMABAD	Islamabad Capital Territory	7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	ISLAMABAD	t	2026-07-29 09:18:06.706	2026-08-01 08:22:23.06
28b8987b-cafb-4fd1-91b9-aba9ef7898ff	01185	JHOLANARA (A.K)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:06.811	2026-08-01 08:22:23.269
f02c3d24-043e-4f72-8927-4b219a841bf5	00972	KHAWAZA-KHELA(S	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:07.07	2026-08-01 08:22:24.29
05a5071f-be7e-4c94-b318-b964208abcd1	00737	KOHAT(CEMENT FA	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	KOHAT	t	2026-07-29 09:18:07.117	2026-08-01 08:22:24.474
c14a48f8-7be8-48af-b171-3e3105d14cae	01195	PANYIOLA (A.K.)	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	RAWALAKOT (A.K)	t	2026-07-29 09:18:07.798	2026-08-01 08:22:26.143
910d2f5b-531f-4466-868e-af2982f6e439	00975	SAIDU SHARIF (S	Khyber Pakhtunkhwa	4740d071-cb15-43e2-a5cb-339f17016116	MINGORA  (SWAT)	t	2026-07-29 09:18:08.06	2026-08-01 08:22:27.429
c0736480-1b78-44ef-99c7-a72d1269c6e4	00782	SEHAR MANDI(A.K	Azad Kashmir	4740d071-cb15-43e2-a5cb-339f17016116	KOTLI (A .K)	t	2026-07-29 09:18:08.157	2026-08-01 08:22:27.636
\.


--
-- TOC entry 5696 (class 0 OID 22554)
-- Dependencies: 274
-- Data for Name: courier_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courier_zones (id, code, name, is_active, created_at, updated_at, rate_less_than_10kg, rate_greater_or_equal_10kg) FROM stdin;
7d612be6-b679-49ee-aa3f-1c9b26dcc2a6	A	Zone A	t	2026-07-29 09:18:05.406	2026-08-01 09:19:06.073	50.00	35.00
09c212e9-7926-4cb7-aac4-6be051ef9e3d	B	Zone B	t	2026-07-29 09:18:05.412	2026-08-01 09:19:06.096	60.00	45.00
ee2726a8-1562-48a2-a5a8-9daa99729f7a	C	Zone C	t	2026-07-29 09:18:05.414	2026-08-01 09:19:06.114	70.00	50.00
58dae26b-44d2-43ac-9424-1a7926196e32	D	Zone D	t	2026-07-29 09:18:05.416	2026-08-01 09:19:06.131	100.00	80.00
4740d071-cb15-43e2-a5cb-339f17016116	E	Zone E	t	2026-07-29 09:18:05.418	2026-08-01 09:19:06.148	120.00	110.00
\.


--
-- TOC entry 5653 (class 0 OID 21156)
-- Dependencies: 231
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_addresses (id, customer_id, label, first_name, last_name, company, address_line1, address_line2, city, state, postal_code, country, phone, is_default_billing, is_default_shipping, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5654 (class 0 OID 21177)
-- Dependencies: 232
-- Data for Name: customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_groups (id, name, description, is_default, tax_class_id, discount_percent, metadata, created_at, updated_at) FROM stdin;
8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	default	Default customers	t	\N	0.00	{}	2026-05-04 06:53:26.01	2026-07-11 11:16:33.261
\.


--
-- TOC entry 5655 (class 0 OID 21191)
-- Dependencies: 233
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, email, password_hash, first_name, last_name, phone, is_guest, customer_group_id, metadata, created_at, updated_at, email_verification_token, is_email_verified, reset_password_expires, reset_password_token) FROM stdin;
c2998d10-8ed5-423a-9bd2-c75f1ca2633a	smhuzaifa525@gmail.com	$2b$10$Lj3Jj71ICjAoRVyddhXnYuhg/lWP3NHsJDL.5jl3iqvW5mWq8rOrW	syed	huzaifa	\N	f	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	{}	2026-07-11 11:13:25.514	2026-07-11 11:14:01.149	\N	t	\N	\N
\.


--
-- TOC entry 5656 (class 0 OID 21206)
-- Dependencies: 234
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, product_id, variant_id, warehouse_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, updated_at) FROM stdin;
d9d76782-cbfc-42e9-932a-e2d102a1a02e	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	default-warehouse	100	0	100	10	2026-05-04 07:01:30.851
9ce82ac9-8d8b-416a-b23c-4c61c1ecafe8	f22228fb-4106-4dc0-8a63-b4e6093b8c28	f3412483-d994-4600-89c0-6f06d2e40ef8	default-warehouse	100	0	100	10	2026-08-17 11:21:19.345
b090fcda-7fd0-491f-a568-eb88e441fdd6	64289463-e48b-4261-bfef-e59b622eb20e	\N	default-warehouse	99	14	85	10	2026-05-07 11:45:56.203
c2dcd150-bdf3-494e-ba63-257e03c8fae1	df541ce1-98b2-49a0-8479-f5a9e1532a85	120f37f1-42aa-45c0-b801-4731330886e3	default-warehouse	100	1	99	10	2026-06-19 10:59:14.279
8ecbf34f-6e3c-4a54-865c-96b2cfd61db3	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	default-warehouse	100	2	98	10	2026-05-07 06:55:48.037
caf29d2a-ac95-41a5-a473-731481b1993f	0019bc5a-cfda-423a-8033-04e19527878c	\N	default-warehouse	100	1	99	10	2026-05-08 05:31:15.452
5f2d8a61-add9-41f3-8fc0-d6ee125a27ea	0e953924-85eb-433e-aab8-172352c47c20	5b793fee-7b4c-488b-963a-d2dfcff60d1b	default-warehouse	100	0	100	10	2026-08-17 11:21:26.413
8bf11b7e-3ec1-41dc-9dc4-08fc531f067a	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	21cd4993-8fab-4fe5-8b1f-5a69661eb6e9	default-warehouse	100	0	100	10	2026-08-17 11:22:03.785
1bdff988-c9b1-48af-a2c3-e5885d48a1bb	42881996-e1e9-48b5-bc90-7879faa68e99	e777530b-83de-4e6b-8b54-5db5ea6e97a4	default-warehouse	100	0	100	10	2026-08-17 11:22:17.554
6421980d-1ad0-4447-9f3d-7d4ba24415ee	d9c95ec4-df7a-4778-86bb-c3818e8cac28	bd42445d-9f3c-40f4-9cdf-a6f2e19947b5	default-warehouse	100	0	100	10	2026-08-17 11:22:48.034
8d80d4e9-85d9-44f2-8fb2-9266341838e7	c7d28472-8483-416b-908b-39bbd023e33e	28825a16-ce19-45ca-be5a-c61e7d62b418	default-warehouse	100	0	100	10	2026-08-17 11:23:07.889
87e1a114-de45-43b5-a855-2a8f5dd87896	93b883de-d033-4336-99bf-d802b93e700f	6b83fd33-f2a0-44f6-aefa-6040ddebfe38	default-warehouse	100	0	100	10	2026-08-17 11:23:49.431
5797ca37-9cf9-4318-af0d-95dae7b41bd1	9888d0bb-b6d8-47b7-8132-28dd4147cb43	97e0bb0b-e90b-417d-9cc7-b1b2230b18cf	default-warehouse	100	0	100	10	2026-08-17 11:24:23.686
de8984db-3b2f-4b1f-ac53-6467db8c234a	3edc41b7-3996-4d29-8ece-a8282dd70fda	2edfd8cf-1fc1-420d-956a-4641349eebc3	default-warehouse	100	0	100	10	2026-08-17 11:27:34.461
405a0ec8-c512-4d41-bf76-83f0bd6fe51c	bed71484-1d2a-48b7-8947-2bba63063442	2be2da7e-c395-4ea3-8ea9-2abcc7f79b58	default-warehouse	100	0	100	10	2026-08-17 11:28:11.347
af428a57-5a04-43c1-b465-a09bdd5a54d7	2f9be750-3d78-4030-8721-beca75a69b46	077cabf2-9484-4b1f-8ba8-d2960bc6e20f	default-warehouse	100	0	100	10	2026-08-17 11:29:15.694
af8ceb4d-624a-4805-8556-c96326ce9a2d	80f348a7-d613-4955-87c8-13b23f6034c6	87555558-4a6c-44c3-ba89-106bb3760e08	default-warehouse	100	0	100	10	2026-08-19 07:44:19.491
f0e8c665-72f1-4e6f-88ac-1cc55c42a368	8424893c-142f-4bbd-ad5f-72423b437023	1fb09500-0aea-45cd-98c8-027a6b3e5081	default-warehouse	100	0	100	10	2026-08-19 07:45:32.531
0a4aa0ef-7ca5-411c-a43c-c490d1d47955	eb72e342-64df-4566-8029-db2c63859130	c36c179e-c2af-4e00-beea-dfd8a3cdec2c	default-warehouse	100	0	100	10	2026-06-19 08:26:46.245
da03eeb2-7a69-453b-ac43-d7ccf312e55d	eb72e342-64df-4566-8029-db2c63859130	fdf241e4-b0d0-456e-8da6-eef5c1124666	default-warehouse	98	0	98	10	2026-07-09 12:04:12.616
4bb64e24-e1d4-4fdb-a55c-d9294878bae1	eb72e342-64df-4566-8029-db2c63859130	663e25b8-ac9e-4892-b47c-c2e9514ef716	default-warehouse	100	0	100	10	2026-06-19 08:26:50.464
8fbddf7a-6c33-4ab9-98c9-83582fbd4356	1b043109-6718-4011-b376-ac801a7aa13a	35a641be-437b-4adb-b950-4253633982ff	default-warehouse	100	0	100	10	2026-08-19 07:45:45.592
4bcc68dc-fb6e-4747-888f-d6cac4dc7a4a	aa5a044f-6947-42ac-88d2-19535c17ea2c	26d5e0a6-ff90-4b3f-af55-7eb02c45cc97	default-warehouse	100	0	100	10	2026-08-19 07:46:27.993
31ed8490-3c95-4f4a-b6e3-5e4a8677ea22	b4366645-b14a-4de1-b621-e8776dc4f689	cd8e05c4-96f5-488b-aa34-74083d3e2978	default-warehouse	100	0	100	10	2026-06-19 08:27:48.992
1a6785e7-8938-48eb-82a9-987fa57ca3d5	b4366645-b14a-4de1-b621-e8776dc4f689	ad533fd1-8637-4268-bf5c-c8dcd1febdc6	default-warehouse	100	0	100	10	2026-06-19 08:27:48.998
4ec3b6cd-0c6e-44df-8f6f-08fd72684f89	b4366645-b14a-4de1-b621-e8776dc4f689	34eddf36-827a-4247-9037-4af9dae3a462	default-warehouse	100	0	100	10	2026-06-19 08:27:49.003
4b853d56-56d2-4c72-b008-f093a6f2911b	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	bc2cbe51-541e-4bd6-a6dc-18ad784d0da2	default-warehouse	100	0	100	10	2026-08-19 07:46:40.163
36ae4515-34fd-4626-abbc-67038eb0fd50	230f5c47-5d61-4da1-adfc-6aa5d46f7111	b0d59239-7b73-492b-8cf8-d0ddba9b5d2e	default-warehouse	100	0	100	10	2026-06-17 14:05:30.854
5ba9dfcb-be6f-4ee6-bef5-677669be5bb6	1f87d70a-7fb5-43e9-a41c-87b29873a33b	3ddee9a7-cbf0-4ce6-9f0a-1b71cf16d076	default-warehouse	100	0	100	10	2026-06-19 08:28:54.968
38352b5d-e67e-4109-9e8c-a8b195bd96fd	07b2bf6a-2585-42f2-a7fd-ecc432b11861	efbf85a4-a7b1-4ead-83db-4c7df04e3790	default-warehouse	99	1	98	10	2026-06-22 09:00:05.248
04e61e53-0d37-4e81-b2c6-827f8eb098b6	b4366645-b14a-4de1-b621-e8776dc4f689	3fcd3a63-0d69-4368-8078-4094c1f0d595	default-warehouse	100	0	100	10	2026-07-01 14:45:11.323
a5ca3c26-9814-4692-853b-b13bef9e1ef4	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	default-warehouse	97	0	97	10	2026-07-01 15:01:20.46
5e5c6e02-c8c3-4ba6-a63d-73caae2086b5	2881ef70-d26b-4da5-af06-9e0c5795fee4	4e7ea113-5c3c-4315-96f5-357735682caa	default-warehouse	100	1	99	10	2026-07-02 09:47:31.385
f0586044-dd40-4ed1-a302-34bf601e6856	05268a8c-518a-4ff4-8691-3cfdff054382	e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	default-warehouse	100	0	100	10	2026-07-03 07:40:40.932
ea788ec2-ac8c-4bfa-b715-8dfba2435a10	90792798-2b85-4423-8eba-e7f12c64617d	dab15350-43b5-4b34-b7b5-19109578dfb6	default-warehouse	97	3	94	10	2026-07-03 14:44:13.526
82faa21f-b032-4dfa-a325-65ec02dd9035	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	default-warehouse	98	3	95	10	2026-07-03 15:02:46.253
ed00912f-f66e-422b-83d5-f881e8a5ac71	5eaf65df-0faa-4975-be7b-6a2554a04f13	b85f7fa3-cb5b-4754-8399-6f792a3bf635	default-warehouse	99	0	99	10	2026-07-09 12:04:12.69
c77665cb-bfb9-4f9e-b6bf-5fa923f8abe5	09cfaa0d-9088-4e2d-823e-3ad80af8853b	480fc5fd-9198-4c2f-ae38-8a0b052a9313	default-warehouse	98	0	98	10	2026-07-09 12:04:12.702
4b2afae4-8cbd-46ee-b38a-2b1a653ccf06	72c84214-a05b-40e8-9093-d76177afd8d9	80c8d8b5-ebed-42d3-aca4-9611d4585f71	default-warehouse	99	0	99	10	2026-07-09 12:04:12.709
c53e3755-c61f-4843-9307-5374e5991fd2	1f87d70a-7fb5-43e9-a41c-87b29873a33b	f48488c2-d01c-47a1-98f2-8073d9f103db	default-warehouse	99	5	94	10	2026-07-11 11:14:32.703
602b0af2-63a0-4fdd-9435-e9184c6c0359	11920e18-2c21-473c-a201-54cfa6870a03	db9babba-16bb-467b-993a-a82e790c2937	default-warehouse	100	0	100	10	2026-08-17 11:13:21.15
22c4b284-77ba-41d7-9b03-30efa6ae2721	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	c916c054-a802-4e98-8c74-8682c10794f7	default-warehouse	100	0	100	10	2026-08-17 11:22:03.79
7e7452d1-7107-493a-89f6-c20f3beefb25	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	07556f02-fb3e-4da1-86e9-c56d68907342	default-warehouse	100	0	100	10	2026-08-17 11:28:22.012
dc8b31e6-166d-4e97-b2ec-2da2b3de16be	2f9be750-3d78-4030-8721-beca75a69b46	17f49cb8-5877-43cb-aae8-ff336636ee44	default-warehouse	100	0	100	10	2026-08-17 11:29:15.716
7865c55c-92a9-411a-8191-890769167151	42881996-e1e9-48b5-bc90-7879faa68e99	c354d84c-c71d-403e-a2b9-312bd9d226b8	default-warehouse	100	0	100	10	2026-08-17 11:22:17.56
8d1f0727-a7ea-4609-9ea5-8779d6baaed4	80f348a7-d613-4955-87c8-13b23f6034c6	3fc3b9ae-162d-4666-9e1d-62ca4b683ce1	default-warehouse	100	0	100	10	2026-08-19 07:44:19.503
03e07d89-8ab9-4e2c-a2da-0b6ac5094b56	80f348a7-d613-4955-87c8-13b23f6034c6	59068913-f30c-47de-b871-39a7a999be2e	default-warehouse	100	0	100	10	2026-08-19 07:44:19.509
bc95748f-6d01-4bf4-a107-9794b62cc014	d26afe56-30c5-4778-ad65-8d7fff9782f5	57d63dcd-b5ff-4670-9ba5-f25dbc7c2143	default-warehouse	100	0	100	10	2026-08-19 07:44:55.992
9a1431e5-d9c1-41a7-bf0b-d0020f3d0830	3bb1a00d-202e-4c8d-8164-dce9b289a60d	ab01460a-742c-4df1-88a2-d10338e88c7f	default-warehouse	100	0	100	10	2026-08-19 07:47:01.013
290987bd-cf3a-4a25-8e47-1b3af6d3bfa3	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	19ccc911-047d-444b-86d0-3ba6ec03334f	default-warehouse	100	0	100	10	2026-08-17 11:10:40.915
ae902d7d-967f-49a6-9a1a-20a0cd6cf61d	0019bc5a-cfda-423a-8033-04e19527878c	b414b725-03bb-4a19-90e3-fa9607592a4c	default-warehouse	100	0	100	10	2026-08-17 11:12:22.776
2e677494-ce25-41c4-927b-c85066a89b5b	64289463-e48b-4261-bfef-e59b622eb20e	4b64825c-8ab1-459d-b165-3c7d24f2ca40	default-warehouse	100	0	100	10	2026-08-17 11:12:42.82
44cf7324-5e4d-46e8-b6b4-8e0dcecb568c	2ca10703-c8c7-4688-94e8-ac1c930ad511	d7c62cda-b7cf-43c3-806b-e62f07d4db78	default-warehouse	100	0	100	10	2026-08-17 11:13:30.376
49d8f520-4a5a-4275-89ce-7c2a72ee99ec	ad76bca0-acfc-45a6-91c7-1ef7099e9275	02479d88-36af-4f24-bcc5-3961eabd5b44	default-warehouse	100	0	100	10	2026-08-17 11:22:36.498
c5f03aa4-24ce-4ffb-9cdb-ed831664c8b0	ad76bca0-acfc-45a6-91c7-1ef7099e9275	fc990784-5496-43ed-91d2-20dc6d04b4c8	default-warehouse	100	0	100	10	2026-08-17 11:22:36.525
87958a29-5c34-4ac5-be85-e3b06109359b	cada9aad-ebd1-4931-85db-1b5b6d43638a	30cb08f1-d606-4f57-a942-98d856b30eb4	default-warehouse	100	0	100	10	2026-08-19 07:47:14.945
0fb78765-d6ca-4ec5-a971-c5d0b3387f06	d9c95ec4-df7a-4778-86bb-c3818e8cac28	df6ef30f-11b7-4d9d-a11f-7dde056894ab	default-warehouse	100	0	100	10	2026-08-17 11:22:48.047
7bfe95aa-97a6-4c38-912c-358f8a845c61	cada9aad-ebd1-4931-85db-1b5b6d43638a	b7e6e695-bc83-4b05-9939-35b01370313f	default-warehouse	100	0	100	10	2026-08-19 07:47:14.95
65f1f137-69c6-4076-bf09-6ef427f79781	f6fe519e-0c49-4287-b159-38fe55905c25	bad2686d-a6bf-41f6-bd64-40825298a3c5	default-warehouse	100	0	100	10	2026-08-17 11:22:59.921
87e7f220-b4c4-43cd-96b7-97a12079d414	c7d28472-8483-416b-908b-39bbd023e33e	fc07ff65-d84c-4b53-9599-a4d3d797d367	default-warehouse	100	0	100	10	2026-08-17 11:23:07.896
26c3cfe5-ba61-49f5-a34e-7bb031ed2d77	09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	cba4cb74-7292-4609-8c4d-1af78cbd7cbd	default-warehouse	100	0	100	10	2026-08-17 11:23:15.066
5aa3bf2f-aa4e-4c72-8d8c-13b175d576d2	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d3dd1a88-1715-4840-bef4-d5bc7bd90825	default-warehouse	100	0	100	10	2026-08-19 10:28:16.262
77bd1258-89a5-4b43-857e-253b06ccd614	93b883de-d033-4336-99bf-d802b93e700f	08de828e-48ee-4791-adbd-ffeeaeb98bea	default-warehouse	100	0	100	10	2026-08-17 11:23:49.455
1f8e85d9-9681-4c51-b3b6-35611399bcbe	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	f36e0fb5-3f6e-40a9-93bd-4ea16eb3b7d1	default-warehouse	100	0	100	10	2026-08-17 11:24:04.887
9dc6f484-36d1-4f59-b4fb-3e6f48c04357	92c58ce2-1a3a-41a1-9200-b19472198647	51240564-8eb4-4280-9a16-61eeba638f77	default-warehouse	100	0	100	10	2026-08-17 11:24:14.399
67f1b266-1155-41fe-a46c-c26e2fcbc937	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	3fe5a35e-51a0-4a3f-ace9-d47273a5086c	default-warehouse	100	0	100	10	2026-08-17 11:24:50.525
5101c427-21e1-4f5c-b728-bd43047ecae4	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	8d2ae540-cc15-49e3-b014-58c260c9002d	default-warehouse	100	0	100	10	2026-08-17 11:24:50.537
1c84b440-af7f-412d-9c54-b91e591cf3a0	2c7e550f-32a1-465e-b974-f57f152838fb	ab8c8299-d521-4f51-b6a8-1a54272aa64f	default-warehouse	100	0	100	10	2026-08-17 11:27:23.234
fe30bad3-6650-45af-910b-eece5256a3df	2c7e550f-32a1-465e-b974-f57f152838fb	5727189c-7cc0-4ddf-a4a2-db701d7b246b	default-warehouse	100	0	100	10	2026-08-17 11:27:23.246
ce094fbe-6c13-45fc-9246-959d74adec83	3edc41b7-3996-4d29-8ece-a8282dd70fda	b375a668-b488-4aa7-9ea1-d8fe0fd2db2d	default-warehouse	100	0	100	10	2026-08-17 11:27:34.468
a2db84ca-1a15-4a0e-9cef-465016ca12fe	185d2b70-8297-41cf-afc5-ee14fd38464a	f4a8ef89-5c3d-4146-9b16-f3fd41fa2442	default-warehouse	100	0	100	10	2026-08-17 11:27:46.222
0dee5633-5025-4cb0-8e05-bf618e652243	bed71484-1d2a-48b7-8947-2bba63063442	6811c0c2-1a06-4eb9-8e28-dabb18a431cc	default-warehouse	100	0	100	10	2026-08-17 11:28:11.352
4b6e396e-ac11-4194-a736-a973c31d80b6	48d973ce-0795-4e24-9adb-d897c7d8d8a9	8a8ab41b-1143-41d7-8dbf-3d6317a6eaac	default-warehouse	100	0	100	10	2026-08-17 11:21:43.057
989afb70-a00a-4a89-9916-9c5eca3b9333	9888d0bb-b6d8-47b7-8132-28dd4147cb43	8f287418-9523-43fd-9074-ac6381aff7d0	default-warehouse	100	0	100	10	2026-08-19 07:17:04.345
aa49fac7-cf5d-4c11-896d-684f8ee71086	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d6756dc5-efdd-414e-a06f-08dee6f14af9	default-warehouse	100	0	100	10	2026-08-17 11:22:03.796
2110ee72-5b9b-4c4a-b7ba-e0bd21244d34	2f9be750-3d78-4030-8721-beca75a69b46	c85a4b4a-5f36-4754-b5d2-6165b5bdf977	default-warehouse	100	0	100	10	2026-08-17 11:29:15.711
7e625dfc-4203-4277-adf8-0155641c3b09	ad76bca0-acfc-45a6-91c7-1ef7099e9275	186b320e-1ce1-4242-9fe0-a2382c9a3cff	default-warehouse	100	0	100	10	2026-08-17 11:22:36.519
7833c0b4-51e4-4c9c-8190-f42a6eb6c22b	65777ded-ce30-4523-8c74-38c8f3c90e21	0ab2a210-3672-4ec1-83c7-d62d89660171	default-warehouse	100	0	100	10	2026-08-19 07:44:39.594
5d9274bd-21c0-4082-9965-3057d5cf92ff	d9c95ec4-df7a-4778-86bb-c3818e8cac28	3304f70d-4296-4e6e-8af3-2296b477bb76	default-warehouse	100	0	100	10	2026-08-17 11:22:48.041
00ec633c-2430-4ae5-9239-5c8f9a31ae70	d26afe56-30c5-4778-ad65-8d7fff9782f5	84fb9d05-ccba-4e7b-9768-babc21a071a0	default-warehouse	100	0	100	10	2026-08-19 07:44:55.986
5f57f07b-a459-43ef-b871-fae632942812	93b883de-d033-4336-99bf-d802b93e700f	698a8acc-c5bd-43a5-89dd-e122bf57834e	default-warehouse	100	0	100	10	2026-08-17 11:23:49.437
f312bcb2-badb-446f-b23e-a22d47c6f36e	1b043109-6718-4011-b376-ac801a7aa13a	f5688887-d66e-4e88-ae6f-68c9fca398fb	default-warehouse	100	0	100	10	2026-08-19 07:45:45.605
4c4367dc-ae38-414a-b967-b1a0a6c388fe	cada9aad-ebd1-4931-85db-1b5b6d43638a	7fbcd890-2de8-48c9-a6fd-0baec249480b	default-warehouse	100	0	100	10	2026-08-19 07:47:14.939
c54f291a-03cd-4712-8cc5-9f8c2ac95024	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	2d89e90f-94d1-4532-a36f-9d2171e9dfd7	default-warehouse	100	0	100	10	2026-08-17 11:10:40.929
98597c54-1fe6-4ae6-bf10-f458487277d0	0019bc5a-cfda-423a-8033-04e19527878c	d0290fe1-2312-459e-be85-97fba9a5a1a6	default-warehouse	100	0	100	10	2026-08-17 11:12:22.782
0415f3cd-3c34-4c59-a3b8-ae74eebcafb5	eaacdf54-eaa9-4dcc-839e-a10a61588523	71355584-5775-4be1-806a-f3c9575f9e31	default-warehouse	100	0	100	10	2026-08-17 11:12:32.322
5e834249-29d7-4407-bd03-e38b99c7664b	2e6248be-15bb-45a8-8dc1-245118193c6f	ea7a85c4-ee49-4236-8415-9ef721211e62	default-warehouse	100	0	100	10	2026-08-17 11:13:05.514
2920158b-5cf8-4180-adad-f1d5444fcf2d	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	484a9ea0-79ac-4b5e-996c-c4d376c1803e	default-warehouse	100	0	100	10	2026-08-17 11:13:12.758
e7a054f4-9434-41f9-ae81-b8e1f0e3dda3	ff11dcac-4171-4d61-99a3-b2cc9d174de1	bff4e473-e6be-454e-ab4f-98f7a6fa847d	default-warehouse	100	0	100	10	2026-08-17 11:13:38.972
6c27d815-e020-47b1-a080-2a72672aacd5	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	92735483-f886-44e0-8741-c482c64190a6	default-warehouse	100	0	100	10	2026-08-17 11:24:04.892
cafe32f3-5c53-41b1-9a02-0099e5784779	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	3fd2dd57-5c35-455b-9c00-b8a766c99af8	default-warehouse	100	0	100	10	2026-08-17 11:24:50.532
90e37a85-5fd1-48d4-9708-6e05e1ec9e0a	2c7e550f-32a1-465e-b974-f57f152838fb	1acc5109-eb3a-4edb-a7d4-ab5c0acee9a8	default-warehouse	100	0	100	10	2026-08-17 11:27:23.24
1c8b82c3-09da-4471-bd3c-6f6f3de1ea95	3edc41b7-3996-4d29-8ece-a8282dd70fda	4cfa35e8-6818-427d-b431-2801720af628	default-warehouse	100	0	100	10	2026-08-17 11:27:34.474
88d75356-aadd-4dd1-97d4-b591147f34a0	3edc41b7-3996-4d29-8ece-a8282dd70fda	db89aec9-bb55-4000-872f-4214f59b138d	default-warehouse	100	0	100	10	2026-08-17 11:27:34.485
a3997cd3-450b-4571-98c1-5d63d4f722dc	185d2b70-8297-41cf-afc5-ee14fd38464a	32db76b1-c4d2-4c23-a520-a54607b6e741	default-warehouse	100	0	100	10	2026-08-17 11:27:46.21
3c27c45b-da1d-4345-9f3a-145ad7ac43f6	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	44ed96d0-8f82-4911-9a93-ab8eb6494607	default-warehouse	97	0	97	10	2026-08-19 08:26:12.483
7d88c71f-9832-44bb-a32a-be064a8aa32c	2f9be750-3d78-4030-8721-beca75a69b46	1a42be08-74ff-45a1-b314-9e8a55dfb574	default-warehouse	100	0	100	10	2026-08-17 11:29:15.7
c9200d2c-1a74-4679-8baa-0e2d1b735210	2f9be750-3d78-4030-8721-beca75a69b46	150978ca-a27a-4fe9-ad9c-a7c78fc625b9	default-warehouse	100	0	100	10	2026-08-17 11:29:15.706
2e1e537c-7794-4407-b110-7f5711008dc6	703a281b-41db-4a68-9833-1726f52f77ac	5d134927-3268-4c92-93d9-681783b1ef2f	default-warehouse	100	0	100	10	2026-08-17 11:21:50.839
1b4209b9-366d-4b26-8738-bb0e7479af5c	65777ded-ce30-4523-8c74-38c8f3c90e21	1cdea472-3122-4629-88b2-59a8415d0e92	default-warehouse	100	0	100	10	2026-08-19 07:44:39.6
e3c08225-2fb2-4d7d-9d2a-34029071d95c	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	01db20e4-da5e-413d-9d59-afd69e903448	default-warehouse	100	0	100	10	2026-08-17 11:22:03.802
ffcad80c-7d23-4cd4-a5a1-9a8f848efae2	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	9a320130-4450-4711-a7a8-52fcb50022cf	default-warehouse	100	0	100	10	2026-08-17 11:10:40.922
db695452-a83f-4048-a6a2-9534ff6e75bc	11920e18-2c21-473c-a201-54cfa6870a03	7dccb3d2-1700-4b01-8ae2-3b27defd96e4	default-warehouse	100	0	100	10	2026-08-17 11:13:21.145
6b8f0fb2-dd5e-43fd-b21f-8641e0a53787	8424893c-142f-4bbd-ad5f-72423b437023	03314898-7431-4813-963b-c114c9a5a7b1	default-warehouse	100	0	100	10	2026-08-19 07:45:32.524
f9f379e1-37ff-4b1d-a95b-7f334f14b09b	ff11dcac-4171-4d61-99a3-b2cc9d174de1	3dbb8353-749c-4007-966b-7709efc0806d	default-warehouse	100	0	100	10	2026-08-17 11:13:38.979
70d3d3cc-1356-434d-bcaf-09a27556209d	8424893c-142f-4bbd-ad5f-72423b437023	5c8de76c-f0f9-4651-a4e0-aacb4cdcbc3c	default-warehouse	100	0	100	10	2026-08-19 07:45:32.537
b4daac0d-ad55-4808-9f9e-c8e4cf6adcd4	42881996-e1e9-48b5-bc90-7879faa68e99	7f217385-809c-43e1-963d-b4ba213ff7ea	default-warehouse	100	0	100	10	2026-08-17 11:22:17.571
b9834405-31e6-44a4-8e87-f82b810c2a31	42881996-e1e9-48b5-bc90-7879faa68e99	86fe4a20-100b-4f78-a8d0-c6d47553ce93	default-warehouse	100	0	100	10	2026-08-17 11:22:17.578
551efbc4-4a32-4902-99c5-a92c5dcb202b	1b043109-6718-4011-b376-ac801a7aa13a	5d316832-1b46-4461-916a-334c84d31170	default-warehouse	100	0	100	10	2026-08-19 07:45:45.598
e11bb180-4b71-4d25-8b87-ca42ed275a32	d9c95ec4-df7a-4778-86bb-c3818e8cac28	818bb94d-4faf-4af2-8e48-ccf3bb712d4c	default-warehouse	100	0	100	10	2026-08-17 11:22:48.06
1a71a6e9-fa44-4e50-9e23-6de82083d5de	09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	2b4f665e-d2cd-4633-8e6f-e78ef1a17ca8	default-warehouse	100	0	100	10	2026-08-17 11:23:15.061
4237b56a-a6e5-4f20-a3bf-a998fe558d52	426328ce-253f-4477-b6ad-0842c4f8da51	a2f2e676-56a8-4415-8834-a7c8824b6a13	default-warehouse	100	0	100	10	2026-08-19 07:46:04.24
fd2e66aa-5d15-481a-b98c-3bb53bfc66be	93b883de-d033-4336-99bf-d802b93e700f	a5eda025-6ee1-469a-8937-6280547a3347	default-warehouse	100	0	100	10	2026-08-17 11:23:49.45
d39ce0b9-2aaf-473f-9b80-9a7a43e80044	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	08f139df-d8b4-4ee7-9e93-61317b186a00	default-warehouse	100	0	100	10	2026-08-17 11:24:04.875
80355f11-895c-4e5a-8bd8-1fe4419352f7	426328ce-253f-4477-b6ad-0842c4f8da51	0724246d-0578-4106-837f-ed0d60a79e46	default-warehouse	100	0	100	10	2026-08-19 07:46:04.246
c107f84a-6750-4c2b-82bf-fefe25eb7a29	9888d0bb-b6d8-47b7-8132-28dd4147cb43	9e606a21-af89-4d73-b9bf-4472ff252b36	default-warehouse	100	0	100	10	2026-08-18 11:29:38.622
bc1a8e72-1aba-4d26-bd1c-64956f355e16	aa5a044f-6947-42ac-88d2-19535c17ea2c	59e51fb0-c229-42c1-827e-4e36005ff97b	default-warehouse	100	0	100	10	2026-08-19 07:46:27.999
b2dcbd24-352c-42c9-a934-6bb26f472ddd	9888d0bb-b6d8-47b7-8132-28dd4147cb43	39b4f942-20a1-4c7f-afa3-5d294305faf0	default-warehouse	100	0	100	10	2026-08-17 11:24:23.698
8b353ae2-3b7b-4609-9740-6d110f3ef304	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	b0bac037-5a47-4b73-a76e-cd3290a4c139	default-warehouse	100	0	100	10	2026-08-19 07:46:40.156
27497b4c-ce9a-447c-9713-4f53b93d6e16	3bb1a00d-202e-4c8d-8164-dce9b289a60d	c7cf9c18-b833-4f4c-b8b7-4a307b71fc3a	default-warehouse	100	0	100	10	2026-08-19 07:47:01
c1f28053-5ef5-4dc3-b993-e75fdd18c898	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	f3ad0845-7231-4cad-8081-e6a4ebfcfaa4	default-warehouse	100	0	100	10	2026-08-17 11:24:50.546
75e7aa30-229f-47d6-8c30-043c34ac26b9	92c58ce2-1a3a-41a1-9200-b19472198647	a1ce5c73-d36d-45ff-b59f-426ed7d072bc	default-warehouse	100	0	100	10	2026-08-19 08:27:55.115
97a66fd3-9953-4042-8a8a-0d585666950a	2c7e550f-32a1-465e-b974-f57f152838fb	2fcecb5b-c280-4348-87bd-d644b4e671d4	default-warehouse	100	0	100	10	2026-08-17 11:27:23.221
11ec422b-75e2-41f1-b42d-90b29ba2629e	2c7e550f-32a1-465e-b974-f57f152838fb	1b58621b-3d2a-4e9d-ae99-d7d51f2d7d2e	default-warehouse	100	0	100	10	2026-08-17 11:27:23.227
bb7600d2-55ec-428b-8a87-19588ba4f386	3edc41b7-3996-4d29-8ece-a8282dd70fda	26db009d-b92e-4cc0-8240-241abff4f821	default-warehouse	100	0	100	10	2026-08-17 11:27:34.48
a992d431-93c3-4471-880b-689fa32ba8b7	185d2b70-8297-41cf-afc5-ee14fd38464a	f9afe415-357b-4495-9edd-18cd2b566964	default-warehouse	100	0	100	10	2026-08-17 11:27:46.197
0c746f4a-3aca-4774-8ea6-f50be322da1e	185d2b70-8297-41cf-afc5-ee14fd38464a	665e39cf-cb52-465c-afa4-f628fc6d3615	default-warehouse	100	0	100	10	2026-08-17 11:27:46.204
8c78196a-65be-4471-a019-6fa719dada84	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	99e65965-36d9-4942-905d-0bb4f1ff44a4	default-warehouse	100	0	100	10	2026-08-19 07:17:10.007
b116b370-63e8-4182-9e4e-9ef984d22c3a	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	85666d70-c39f-4337-ac51-60d5f4488c1e	default-warehouse	100	0	100	10	2026-08-17 11:28:21.994
61c8007c-0c62-4065-9c4b-81b0ed27ae98	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	3a50b8f0-ecb7-4ef4-a8c5-c648c55b5b6e	default-warehouse	100	0	100	10	2026-08-18 10:39:05.54
2e18be98-f706-4856-9ec4-376dcaf4b348	67adc18a-0b78-4b7e-9d85-791c11360d96	d8ac9ee5-3071-471f-ba8f-c7562e6e20f1	default-warehouse	100	0	100	10	2026-08-17 11:21:35.289
8745f3b3-5b1e-4754-a54d-9a474b4c781a	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	fd301154-c132-4757-b8c2-4dbfb0d4da47	default-warehouse	100	0	100	10	2026-08-17 11:22:03.777
2e560319-8a37-4903-a81e-eac73558e659	65777ded-ce30-4523-8c74-38c8f3c90e21	f7c1809a-924d-4752-83b3-278ddfe0a86e	default-warehouse	100	0	100	10	2026-08-19 07:44:39.605
ff193c6a-5905-47ec-90a1-3e6570cddbc6	d26afe56-30c5-4778-ad65-8d7fff9782f5	1cd4a1fd-7be4-4536-a9f8-fb5262991f0b	default-warehouse	100	0	100	10	2026-08-19 07:44:55.98
30c66d88-7de5-4523-939b-3f6fa3bd30aa	426328ce-253f-4477-b6ad-0842c4f8da51	1a40c60b-25e5-4daf-a894-6c5ff37c21ae	default-warehouse	100	0	100	10	2026-08-19 07:46:04.233
41c9ea96-b979-42e4-8060-75fbb5eed58f	aa5a044f-6947-42ac-88d2-19535c17ea2c	4176054d-5f79-4916-8ae3-6ea1c4ceecfe	default-warehouse	100	0	100	10	2026-08-19 07:46:27.987
646e922c-54d7-4bfa-b5b1-193637a45be0	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	726c60a2-c0eb-4913-8a36-a867105b693d	default-warehouse	100	0	100	10	2026-08-17 11:10:40.903
53dae032-7068-4247-bd04-89654f9b886e	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	821bb87e-92d3-4ed7-98ad-0ad328271b2c	default-warehouse	100	0	100	10	2026-08-17 11:10:40.934
c22c16cd-6055-4716-a1a4-d04d5123bebc	42881996-e1e9-48b5-bc90-7879faa68e99	bef9d1f2-0bff-48ac-b287-28cde0bf9d10	default-warehouse	100	0	100	10	2026-08-17 11:22:17.566
dc92fd22-a290-44ea-9233-30c694fc04b2	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	cf7b7300-fe24-405f-9349-ab0c0e57e28d	default-warehouse	100	0	100	10	2026-08-19 07:46:40.169
264b27e3-f243-4c9a-8051-01865601c9ce	ad76bca0-acfc-45a6-91c7-1ef7099e9275	d72ede7d-51a0-4b8a-897e-de58e6ae1516	default-warehouse	100	0	100	10	2026-08-17 11:22:36.507
1e71bc0b-656a-4f59-8b65-bfe5336c1de1	ad76bca0-acfc-45a6-91c7-1ef7099e9275	3a9d2b1a-8683-4305-8e74-9b8ef9975ecf	default-warehouse	100	0	100	10	2026-08-17 11:22:36.513
ccf9d46a-060b-4085-95a3-b5dbab886528	3bb1a00d-202e-4c8d-8164-dce9b289a60d	08c6f0a0-45c4-478e-b8b3-73a6bfd2425c	default-warehouse	100	0	100	10	2026-08-19 07:47:01.007
43a7188b-cf79-45ac-8f9c-2668098a8b6b	d9c95ec4-df7a-4778-86bb-c3818e8cac28	9ba01678-18ec-43d8-aa86-1324fe5ae531	default-warehouse	100	0	100	10	2026-08-17 11:22:48.053
606f65f8-1091-4b62-953a-fbd71de46c8e	f6fe519e-0c49-4287-b159-38fe55905c25	d971ec3a-610e-4320-b6a2-13cced2b87ac	default-warehouse	100	0	100	10	2026-08-17 11:22:59.916
98cf82e1-0ae0-473d-ab0d-3e4181819757	93b883de-d033-4336-99bf-d802b93e700f	f7256127-9f87-4def-97d6-ef4dfa0aa01a	default-warehouse	100	0	100	10	2026-08-17 11:23:49.443
94052fd9-6a1d-433c-8b00-ecac1e5c5ef7	92c58ce2-1a3a-41a1-9200-b19472198647	f8588e5d-9c08-46fd-a898-9aa2f84906c8	default-warehouse	100	0	100	10	2026-08-19 08:36:55.109
c874ce35-5252-4a2e-85a2-1c26c1d50c93	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	70f3a35c-1a0f-4cfa-9c33-8810c2a04913	default-warehouse	100	0	100	10	2026-08-17 11:24:04.881
f6716358-269a-4be6-a762-8a7df71612e7	9888d0bb-b6d8-47b7-8132-28dd4147cb43	4c3c762a-ef77-48cf-95d8-ca9781e23939	default-warehouse	97	0	97	10	2026-08-19 10:30:20.788
8a315605-fd54-498a-b310-a9c417d3f3e7	92c58ce2-1a3a-41a1-9200-b19472198647	33973007-0839-4dd3-8c6f-af8b8ac76ffb	default-warehouse	100	0	100	10	2026-08-17 11:24:14.406
a957a9cd-7b7d-47e4-a743-87864072c6ce	92c58ce2-1a3a-41a1-9200-b19472198647	90aaf524-b20d-4ccb-a762-81ed063917e8	default-warehouse	100	0	100	10	2026-08-17 11:24:14.411
4b7a0847-8f11-44b1-b454-5394e61f54d1	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	014ae71e-970a-4a6f-aa77-d16bcf7ff5cc	default-warehouse	100	0	100	10	2026-08-17 11:24:50.552
3d91db9f-ab3c-48f7-acb5-f31143429914	185d2b70-8297-41cf-afc5-ee14fd38464a	1822b85a-61a6-4942-bcb3-1295d7bc8cea	default-warehouse	100	0	100	10	2026-08-17 11:27:46.216
a1ff8d08-01b4-4276-aeb5-caf969b46c50	93d74064-c8a2-47bf-8eee-1065890b9787	a1ad008c-9ad0-4db3-9932-bc48e58ecdb8	default-warehouse	100	0	100	10	2026-08-17 11:27:53.987
4624f570-f30c-45aa-8292-1cce028ddba4	cafb9e6a-4403-4838-8235-1f2b976df6a8	e00ecc16-14e6-448e-b745-bf555ffe3d3f	default-warehouse	100	0	100	10	2026-08-17 11:28:00.451
\.


--
-- TOC entry 5657 (class 0 OID 21222)
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
54f61879-9dfb-41f5-9a12-4979a7534b99	ea788ec2-ac8c-4bfa-b715-8dfba2435a10	cart	d8a718b1-bbd1-40b5-b5c3-0a6eafd76da8	1	2026-07-01 14:57:24.462	2026-07-01 14:27:24.47
a9267d7f-8ea5-4bcd-9145-7fff5cb7b472	5e5c6e02-c8c3-4ba6-a63d-73caae2086b5	cart	d8a718b1-bbd1-40b5-b5c3-0a6eafd76da8	1	2026-07-01 14:58:15.538	2026-07-01 14:28:15.54
41e54d79-f18c-446e-9db6-280f03fd2b4e	82faa21f-b032-4dfa-a325-65ec02dd9035	cart	cfe3618a-3090-429f-a305-2784be5a4bd4	1	2026-07-01 15:31:27.035	2026-07-01 15:01:27.036
aef300ce-728d-4fb2-ae54-b2cb2cca462e	ea788ec2-ac8c-4bfa-b715-8dfba2435a10	cart	6fdc6a44-de30-4880-aba7-ddbed610f5d7	1	2026-07-02 06:58:53.06	2026-07-02 06:28:53.064
6540f595-ad9a-4da6-858d-8914ca7f8df6	ea788ec2-ac8c-4bfa-b715-8dfba2435a10	cart	49ab6993-0bbf-46f6-9b80-0cf90397d5a5	1	2026-07-03 15:14:13.516	2026-07-03 14:44:13.518
593d4494-daa9-49d2-8774-362ed31e9e2d	c53e3755-c61f-4843-9307-5374e5991fd2	cart	4268a971-83e0-41bf-bbdb-d4b16feb33c4	1	2026-07-03 15:29:05.915	2026-07-03 14:59:05.928
076bb4ac-0df1-4533-91b0-753bc782b86a	82faa21f-b032-4dfa-a325-65ec02dd9035	cart	e5382715-319b-4fd0-b499-df54c68c9615	1	2026-07-03 15:32:46.236	2026-07-03 15:02:46.245
3aa40d3e-8a0a-435e-aee9-8f7638ee2f29	c53e3755-c61f-4843-9307-5374e5991fd2	cart	8c4aadd4-9926-4baa-ac3c-c89daa608559	1	2026-07-08 07:26:07.721	2026-07-08 06:56:07.723
328d676f-ea1e-40a5-a7ea-3a92b0c0bc99	c53e3755-c61f-4843-9307-5374e5991fd2	cart	7b825b46-b543-47c0-a7cd-b3624f1b3be4	1	2026-07-08 07:27:47.507	2026-07-08 06:57:47.51
32e50c20-0994-4bb6-b082-c1771bce3d75	c53e3755-c61f-4843-9307-5374e5991fd2	cart	1d133187-b527-4ba8-87c3-da2a4400b035	1	2026-07-11 11:44:32.693	2026-07-11 11:14:32.695
\.


--
-- TOC entry 5687 (class 0 OID 22175)
-- Dependencies: 265
-- Data for Name: mail_mailboxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mail_mailboxes (id, code, name, purpose, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_enc, from_name, from_address, is_active, is_default, created_at, updated_at) FROM stdin;
0eef67b2-f2ce-4d5a-b382-73828f3c8cef	--	m.essa chemicals	ORDERS	smtp.gmail.com	587	f	huzaifawork525@gmail.com	v1:RTcZfTGZOaeg3jN8m+WilQ==:O8XjRue3pPVulIKo:uXiAAVmZJUHFUv1Nzgk/xg==:APuVtL8C0VVYFyq93C7Tkw==	M. Essa Chemicals	huzaifawork525@gmail.com	t	f	2026-07-01 13:10:24.035	2026-07-01 13:10:24.035
\.


--
-- TOC entry 5658 (class 0 OID 21235)
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
20f85969-8b9d-48e8-9927-41e75320b728	0f0ad1d2-5bd3-47cc-b386-c54b04e9a6b4	90792798-2b85-4423-8eba-e7f12c64617d	dab15350-43b5-4b34-b7b5-19109578dfb6	SKU-020-1PCS	777 Sony Dish Wash Soap	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	20.00	0.00	0.00	20.00	0	0	{"productName": "777 Sony Dish Wash Soap", "productImage": "http://localhost:3000/uploads/products/451ccb4f-99dc-408c-bd90-f5d75263afdf.jpeg", "variantLabel": "Pack: 1Pcs"}	2026-06-23 07:29:45.874
56e4372a-5044-4cd2-b09e-b9a35062304e	be31335b-e593-47e6-ad0d-db7435f45787	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	SKU-016-2LTR	Clean360 Bleach Exra Strong	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	1	180.00	0.00	0.00	180.00	0	0	{"productName": "Clean360 Bleach Exra Strong", "productImage": "http://localhost:3000/uploads/products/8e8d394e-aab0-4c74-8390-41ea4845f784.jpeg", "variantLabel": "Weight: 2Ltr"}	2026-07-01 06:12:36.406
0f7f4a0a-e591-49fe-b0ba-2ac83d0c6922	c8b72004-95d3-49fe-80af-1fa8e8e9d744	1f87d70a-7fb5-43e9-a41c-87b29873a33b	f48488c2-d01c-47a1-98f2-8073d9f103db	SKU-019-SMALL	Super Sony Dish Wash Soap	{"optionValues": {"pack": "Small"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251"}}	1	20.00	0.00	0.00	20.00	0	0	{"productName": "Super Sony Dish Wash Soap", "productImage": "http://localhost:3000/uploads/products/f75f64db-05ba-4ef6-82b6-855acf3a2e68.jpeg", "variantLabel": "Pack: Small"}	2026-07-01 06:25:25.456
cb760b71-7dac-4fbe-94f4-999a76da527a	374b0e7a-eae9-4532-a227-ef47e508ec56	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	SKU-016-2LTR	Clean360 Bleach Exra Strong	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	1	180.00	0.00	0.00	180.00	0	0	{"productName": "Clean360 Bleach Exra Strong", "productImage": "http://localhost:3000/uploads/products/8e8d394e-aab0-4c74-8390-41ea4845f784.jpeg", "variantLabel": "Weight: 2Ltr"}	2026-07-01 06:45:04.569
c15a62ee-1ed1-4934-9afd-860572e74b94	f5461fb7-2ca1-4cf3-a6ba-2471a65322e9	90792798-2b85-4423-8eba-e7f12c64617d	dab15350-43b5-4b34-b7b5-19109578dfb6	SKU-020-1PCS	777 Sony Dish Wash Soap	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	1	20.00	0.00	0.00	20.00	0	0	{"productName": "777 Sony Dish Wash Soap", "productImage": "http://localhost:3000/uploads/products/451ccb4f-99dc-408c-bd90-f5d75263afdf.jpeg", "variantLabel": "Pack: 1Pcs"}	2026-07-01 09:34:07.461
a3d3e275-b211-4616-a956-b4f9d299ae10	a78748f1-7095-49bc-bbdc-e413f1864323	03e5ef08-6883-4fd0-9583-94a2734aad9a	48de193f-546c-4de8-b665-15e8cab49584	SKU-014-1BOTTLE	Panda Liquid Neel	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	1	100.00	0.00	0.00	100.00	0	0	{"productName": "Panda Liquid Neel", "productImage": "http://localhost:3000/uploads/products/66da266a-d52b-46da-a138-77ad84696bef.jpeg", "variantLabel": "Pack: 1Bottle"}	2026-07-01 09:43:56.992
3eba1a58-6d7e-482f-ba24-a80ddaa07833	8938d322-4dd4-48ae-8c07-449fc100f1dc	eaacdf54-eaa9-4dcc-839e-a10a61588523	f44c87d3-ea38-4329-bad9-b0a72e4d955d	SKU-003-ROSE	Hand Wash	{"optionValues": {"flavour": "Rose"}, "optionValueIds": {"flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	1	200.00	0.00	0.00	200.00	0	0	{"productName": "Hand Wash", "productImage": "http://localhost:3000/uploads/products/36c2d557-9508-46cb-8d9e-66a810432851.jpeg", "variantLabel": "Flavour: Rose"}	2026-07-01 13:12:22.745
63e0325c-88bb-45e9-93d7-351321f04987	25c4aa55-f46c-4682-b1d9-4e0ff866fa3a	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	SKU-016-2LTR	Clean360 Bleach Exra Strong	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	1	180.00	0.00	0.00	180.00	0	0	{"productName": "Clean360 Bleach Exra Strong", "productImage": "http://localhost:3000/uploads/products/8e8d394e-aab0-4c74-8390-41ea4845f784.jpeg", "variantLabel": "Weight: 2Ltr"}	2026-07-01 14:51:54.079
eb2bb460-81cb-43f2-9141-77351c5155b8	1e4620dd-bb44-4f87-b998-b45d76cca265	eaacdf54-eaa9-4dcc-839e-a10a61588523	f44c87d3-ea38-4329-bad9-b0a72e4d955d	SKU-003-ROSE	Hand Wash	{}	2	169.64	0.00	0.00	339.28	0	0	{"listPrice": 200, "bundleTitle": "DEAL1", "productName": "Hand Wash", "bundleDealId": "cbdd8647-1dcc-4f77-bfdc-55fbde4f368c", "productImage": "http://localhost:3000/uploads/products/36c2d557-9508-46cb-8d9e-66a810432851.jpeg", "variantLabel": "Flavour: Rose", "bundleGroupId": "2ca20fbe-54d1-4fb0-8e00-cb283de74807", "bundleQuantity": 1, "allocatedDealPrice": 169.64}	2026-07-09 12:04:12.404
6047af7d-b079-42c8-a0e4-c40b8b4f4a11	1e4620dd-bb44-4f87-b998-b45d76cca265	eb72e342-64df-4566-8029-db2c63859130	fdf241e4-b0d0-456e-8da6-eef5c1124666	SKU-008-ROSE	Perfume Phenyl	{}	2	101.78	0.00	0.00	203.56	0	0	{"listPrice": 120, "bundleTitle": "DEAL1", "productName": "Perfume Phenyl", "bundleDealId": "cbdd8647-1dcc-4f77-bfdc-55fbde4f368c", "productImage": "http://localhost:3000/uploads/products/71451c33-cbd4-4a30-83b5-3f4145a8d49a.jpeg", "variantLabel": "Flavour: Rose", "bundleGroupId": "2ca20fbe-54d1-4fb0-8e00-cb283de74807", "bundleQuantity": 1, "allocatedDealPrice": 101.78}	2026-07-09 12:04:12.404
2f4e57fa-6149-4153-a414-6863bbf4e5cc	1e4620dd-bb44-4f87-b998-b45d76cca265	5eaf65df-0faa-4975-be7b-6a2554a04f13	b85f7fa3-cb5b-4754-8399-6f792a3bf635	SKU-010-1-5LTR	Tile Wash	{}	1	67.85	0.00	0.00	67.85	0	0	{"listPrice": 80, "bundleTitle": "DEAL1", "productName": "Tile Wash", "bundleDealId": "cbdd8647-1dcc-4f77-bfdc-55fbde4f368c", "productImage": "http://localhost:3000/uploads/products/e2efe486-c41b-4700-879c-f2debc87b3fd.jpeg", "variantLabel": "Weight: 1.5Ltr", "bundleGroupId": "2ca20fbe-54d1-4fb0-8e00-cb283de74807", "bundleQuantity": 1, "allocatedDealPrice": 67.85}	2026-07-09 12:04:12.404
03bd270b-6f07-471c-8b52-67d95e7dcb82	1e4620dd-bb44-4f87-b998-b45d76cca265	09cfaa0d-9088-4e2d-823e-3ad80af8853b	480fc5fd-9198-4c2f-ae38-8a0b052a9313	SKU-017-2LTR	Sweep-o Floor & Tile Cleaner	{}	1	134.86	0.00	0.00	134.86	0	0	{"listPrice": 159, "bundleTitle": "DEAL1", "productName": "Sweep-o Floor & Tile Cleaner", "bundleDealId": "cbdd8647-1dcc-4f77-bfdc-55fbde4f368c", "productImage": "http://localhost:3000/uploads/products/0c2e39fe-26c3-416f-8cd0-72747aa624be.jpeg", "variantLabel": "Weight: 2Ltr", "bundleGroupId": "2ca20fbe-54d1-4fb0-8e00-cb283de74807", "bundleQuantity": 1, "allocatedDealPrice": 134.86}	2026-07-09 12:04:12.404
7e1d5195-904c-41c8-95c7-702b180dbbbe	1e4620dd-bb44-4f87-b998-b45d76cca265	72c84214-a05b-40e8-9093-d76177afd8d9	80c8d8b5-ebed-42d3-aca4-9611d4585f71	SKU-009-1-5LTR	Toilet Bowl Cleaner	{}	1	169.64	0.00	0.00	169.64	0	0	{"listPrice": 200, "bundleTitle": "DEAL1", "productName": "Toilet Bowl Cleaner", "bundleDealId": "cbdd8647-1dcc-4f77-bfdc-55fbde4f368c", "productImage": "http://localhost:3000/uploads/products/70986ee9-fdb9-43f1-9cf6-0d6e61250ca8.jpeg", "variantLabel": "Weight: 1.5Ltr", "bundleGroupId": "2ca20fbe-54d1-4fb0-8e00-cb283de74807", "bundleQuantity": 1, "allocatedDealPrice": 169.64}	2026-07-09 12:04:12.404
3f9053bb-7e29-4484-9dbb-3fbc8d89fffb	1e4620dd-bb44-4f87-b998-b45d76cca265	64289463-e48b-4261-bfef-e59b622eb20e	698b25db-dba8-4445-904d-42c73dccab7c	SKU-004-PINK-LILY-SMALL	Viva Beauty Soap	{}	2	42.41	0.00	0.00	84.82	0	0	{"listPrice": 50, "bundleTitle": "DEAL1", "productName": "Viva Beauty Soap", "bundleDealId": "cbdd8647-1dcc-4f77-bfdc-55fbde4f368c", "productImage": "http://localhost:3000/uploads/products/eea4ad2d-e2e2-4c52-9ba9-9177c9d5a314.jpeg", "variantLabel": "Flavour: Pink Lily • Pack: Small", "bundleGroupId": "2ca20fbe-54d1-4fb0-8e00-cb283de74807", "bundleQuantity": 1, "allocatedDealPrice": 42.41}	2026-07-09 12:04:12.404
51fbb664-3c21-4934-bdf2-408c537d1866	9acdce7c-b821-41f3-adaf-81a381bf62cc	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	44ed96d0-8f82-4911-9a93-ab8eb6494607	sku-044-500GRAM	Bareek Gathiya	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	550.00	0.00	0.00	1650.00	0	0	{"productName": "Bareek Gathiya", "productImage": "/uploads/products/8e16e949-0d2c-4bba-8214-4f7bba34b620.jpeg", "variantLabel": "weight: 500gram"}	2026-08-19 08:26:12.442
594c5659-4cdb-4499-87ad-46831e41f74a	b30afca4-e29a-42af-9383-0eb534cf4ea3	9888d0bb-b6d8-47b7-8132-28dd4147cb43	4c3c762a-ef77-48cf-95d8-ca9781e23939	sku-035-200GRAM	Dal Chana	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	3	220.00	0.00	0.00	660.00	0	0	{"productName": "Dal Chana", "productImage": "/uploads/products/56a23243-10e0-4b0c-8a58-574ce99fa0e0.jpeg", "variantLabel": "weight: 200gram"}	2026-08-19 10:30:20.738
\.


--
-- TOC entry 5659 (class 0 OID 21262)
-- Dependencies: 237
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping (id, order_id, shipping_method_id, cost, currency, status, tracking_number, tracking_url, courier_code, courier_name, shipped_at, delivered_at, cancelled_at, shipping_address, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5660 (class 0 OID 21280)
-- Dependencies: 238
-- Data for Name: order_taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_taxes (id, order_id, tax_id, tax_class_id, tax_class_code, tax_class_name, country, region, rate, is_inclusive, taxable_amount, tax_amount, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5661 (class 0 OID 21301)
-- Dependencies: 239
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, customer_id, customer_group_id, status, payment_status, fulfillment_status, customer_email, customer_name, billing_address, shipping_address, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, applied_price_rules, ip_address, user_agent, notes, metadata, created_at, updated_at, cancelled_at, completed_at) FROM stdin;
0aaf74b5-f65e-4019-9d3e-fbc88d4b2238	ORD-20260613-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	a.wahab445@gmail.com	test	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	PKR	999.00	0.00	0.00	0.00	999.00	[]	\N	\N	\N	{"checkoutId": "77b158e9-8973-4b6a-936d-1ce7fed26a40", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-13 13:35:13.821	2026-06-13 13:35:13.821	\N	\N
5bbb30ed-34a8-41d2-9d5b-da4510ff51bd	ORD-20260613-00002	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	processing	pending	unfulfilled	a.wahab445@gmail.com	\N	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	{"city": "Karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Wahab", "firstName": "Abdul", "postalCode": "75760", "addressLine1": "House 12345"}	PKR	999.00	0.00	0.00	0.00	999.00	[]	\N	\N	\N	{"checkoutId": "6f672239-62af-4d88-acb8-d46d5fae96a6", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-13 13:35:46.826	2026-06-13 13:45:32.357	\N	\N
654b6efd-d07f-4807-a203-919a9e285841	ORD-20260618-00003	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	4900.00	0.00	0.00	0.00	4900.00	[]	\N	\N	\N	{"checkoutId": "d746b0a1-c8bf-4138-a0fb-2aef0ec911ee", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:21:55.29	2026-06-18 08:21:55.29	\N	\N
dfba12bc-f5ab-4c8e-9f3c-9feecc6a2bae	ORD-20260619-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	guest+b89cb48f-a650-4039-9df4-22b45446512a@checkout.local	\N	{"city": "karachi", "label": "", "state": "Khyber Pakhtunkhwa", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Khyber Pakhtunkhwa", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	10.00	0.00	100.00	0.00	110.00	[]	\N	\N	\N	{"checkoutId": "b89cb48f-a650-4039-9df4-22b45446512a", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 06:57:03.373	2026-06-19 06:57:03.373	\N	\N
a2ef88db-85e1-41f3-b3a1-d8ab6c641dbe	ORD-20260622-00002	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	contentdigital21@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "e885cd37-60f2-4a3c-9a38-a2f58d73d33c", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-22 09:00:05.197	2026-06-22 09:00:05.197	\N	\N
4263ac0a-4ea7-4a2b-8ad5-bbf68a2dc0fd	ORD-20260504-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "KARACHI", "label": "HOME A", "phone": "", "state": "SINDH", "company": "", "country": "PK", "lastName": "HUZAIFA", "firstName": "SYED", "postalCode": "74760", "addressLine1": "SAEEDABAD", "addressLine2": ""}	{"city": "KARACHI", "label": "HOME A", "phone": "", "state": "SINDH", "company": "", "country": "PK", "lastName": "HUZAIFA", "firstName": "SYED", "postalCode": "74760", "addressLine1": "SAEEDABAD", "addressLine2": ""}	USD	32.87	0.00	0.00	0.00	32.87	[]	\N	\N	\N	{"checkoutId": "55b4c288-998d-49f9-bd4b-ac10fae8f79f", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-05-04 07:33:33.36	2026-05-04 07:33:33.36	\N	\N
ed2aa604-ab97-46f0-b68d-e3adc79d8208	ORD-20260618-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	100.00	0.00	0.00	0.00	100.00	[]	\N	\N	\N	{"checkoutId": "44cfe58a-d167-4b32-9dff-f446edceb156", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 07:58:09.323	2026-06-18 07:58:09.323	\N	\N
4c768e17-67dc-4338-954f-579e75b349e5	ORD-20260618-00002	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	50.00	0.00	0.00	0.00	50.00	[]	\N	\N	\N	{"checkoutId": "6a953440-2c02-46b2-888b-07831af3e4b5", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:09:20.864	2026-06-18 08:09:20.864	\N	\N
374b0e7a-eae9-4532-a227-ef47e508ec56	ORD-20260701-00003	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	contentdigital21@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	180.00	0.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "b0e89fc9-8261-4790-bd08-0d16faad079d", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 06:45:04.569	2026-07-01 06:45:04.569	\N	\N
a78748f1-7095-49bc-bbdc-e413f1864323	ORD-20260701-00005	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	contentdigital21@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "a1b1c943-fc6a-4a46-b203-33f7f2c87172", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 09:43:56.992	2026-07-01 09:43:56.992	\N	\N
1e4620dd-bb44-4f87-b998-b45d76cca265	ORD-20260709-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	nomanfoodspk@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Pk", "firstName": "Noman", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "Pk", "firstName": "Noman", "postalCode": "75740", "addressLine1": "baldia"}	PKR	855.82	0.00	200.00	0.00	1055.82	[]	\N	\N	\N	{"checkoutId": "ef0863a0-3801-4d36-b949-2810f6ee9a9b", "shippingMethod": {"cost": 200, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-09 12:04:12.404	2026-07-09 12:04:12.404	\N	\N
6c504841-7bb6-45f0-bf1a-58fda35f2000	ORD-20260618-00004	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	USD	10.00	0.00	0.00	0.00	10.00	[]	\N	\N	\N	{"checkoutId": "07a7fe79-340d-43d5-bb48-7bfc70b24abf", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:23:36.138	2026-06-18 08:23:36.138	\N	\N
b57f8179-1e64-4504-9e63-74e0aff73c27	ORD-20260618-00005	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	10.00	0.00	0.00	0.00	10.00	[]	\N	\N	\N	{"checkoutId": "eede4445-1da2-459b-8a95-b8be94bdea6d", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 08:44:50.292	2026-06-18 08:44:50.292	\N	\N
b65a1ffc-c717-42f5-a104-066d8fd6dd12	ORD-20260618-00006	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	0.00	0.00	100.00	[]	\N	\N	\N	{"checkoutId": "0c428526-f1eb-4864-a84b-d661b026b1fb", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:09:03.079	2026-06-18 09:09:03.079	\N	\N
bc071ff0-87c0-484a-93a4-286961c91d20	ORD-20260618-00007	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	80.00	0.00	0.00	0.00	80.00	[]	\N	\N	\N	{"checkoutId": "d847292b-3d62-40bf-9f11-35fc6e7466f2", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:27:40.29	2026-06-18 09:27:40.29	\N	\N
51ec8a89-eff9-49d9-964e-5420a013ea3b	ORD-20260618-00008	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	200.00	0.00	0.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "93d1db05-b4c2-47fe-803a-829108528166", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:41:10.485	2026-06-18 09:41:10.485	\N	\N
cb80ad0a-2a4f-40e7-a4ac-f3bfbd007b1a	ORD-20260618-00009	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	159.00	0.00	0.00	0.00	159.00	[]	\N	\N	\N	{"checkoutId": "afcc0bdd-f4d3-4a6f-9b95-40fb3881a856", "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:42:40.827	2026-06-18 09:42:40.827	\N	\N
d3559801-23d2-4547-8f47-153a81fd2451	ORD-20260618-00010	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	10.00	99.00	0.00	189.00	[]	\N	\N	\N	{"checkoutId": "bfb2ebb1-4097-40cf-bd9b-ae02bab05c77", "shippingMethod": {"cost": 99, "currency": "PKR", "methodId": "00000000-0000-0000-0000-000000000002", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 09:49:44.552	2026-06-18 09:49:44.552	\N	\N
fc750368-9e2b-4ff9-a64d-fb1693c0b1c9	ORD-20260618-00011	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "khi", "label": "", "state": "sindh", "country": "pk", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	370.00	0.00	99.00	0.00	469.00	[]	\N	\N	\N	{"checkoutId": "f1df211d-eed4-4a25-ad56-fd3a5f9f5478", "shippingMethod": {"cost": 99, "currency": "PKR", "methodId": "00000000-0000-0000-0000-000000000002", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-18 12:38:28.752	2026-06-18 12:38:28.752	\N	\N
701297c8-2e33-4fc7-a618-d181d864d6fa	ORD-20260619-00002	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	370.00	0.00	100.00	0.00	470.00	[]	\N	\N	\N	{"checkoutId": "86756ec5-4383-4260-a2a1-f68302b4b63a", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 07:19:21.228	2026-06-19 07:19:21.228	\N	\N
6d341f68-d4da-4b7f-986b-6b22a3377947	ORD-20260619-00003	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	200.00	20.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "397c979f-5467-4161-91ff-8afd37353997", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 10:59:14.241	2026-06-19 10:59:14.241	\N	\N
fce4769d-051a-4182-a8ee-f013e140c6c9	ORD-20260619-00004	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	180.00	0.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "61e5ec78-ed9e-41de-a213-6a183879565e", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 11:23:13.302	2026-06-19 11:23:13.302	\N	\N
5b3a844d-5a71-4503-8a0e-83e67e5bd951	ORD-20260619-00005	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "9dfd5ac6-9256-4300-a359-03281737ba78", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 11:30:32.378	2026-06-19 11:30:32.378	\N	\N
3f9b5d6c-f5f6-4ba5-96dc-d42e683a3839	ORD-20260619-00006	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	20.00	0.00	100.00	0.00	120.00	[]	\N	\N	\N	{"checkoutId": "7c83b8d2-6393-4ce0-88ef-630f341eb19d", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 12:12:24.443	2026-06-19 12:12:24.443	\N	\N
2b2fec3f-6790-410f-a40a-cb56bb87e12e	ORD-20260619-00007	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	159.00	0.00	100.00	0.00	259.00	[]	\N	\N	\N	{"checkoutId": "ec54292b-8e2f-4eaa-9f2e-45485c42bbcb", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-19 12:39:21.758	2026-06-19 12:39:21.758	\N	\N
4c82e16e-4174-4bdc-a945-f4f335fdc0d5	ORD-20260622-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	100.00	0.00	100.00	0.00	200.00	[]	\N	\N	\N	{"checkoutId": "4a7439f1-fb89-4107-882c-b7678b20e391", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-22 07:35:45.863	2026-06-22 07:35:45.863	\N	\N
0f0ad1d2-5bd3-47cc-b386-c54b04e9a6b4	ORD-20260623-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	20.00	0.00	100.00	0.00	120.00	[]	\N	\N	\N	{"checkoutId": "697bfa2c-0357-440f-946a-7ee51850f3d1", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-06-23 07:29:45.874	2026-06-23 07:29:45.874	\N	\N
be31335b-e593-47e6-ad0d-db7435f45787	ORD-20260701-00001	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	180.00	0.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "e2ec72f4-f922-433d-b64b-be16586c660c", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 06:12:36.406	2026-07-01 06:12:36.406	\N	\N
c8b72004-95d3-49fe-80af-1fa8e8e9d744	ORD-20260701-00002	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	20.00	0.00	100.00	0.00	120.00	[]	\N	\N	\N	{"checkoutId": "0bfc9eb1-9182-4521-8967-17271e363a5b", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 06:25:25.456	2026-07-01 06:25:25.456	\N	\N
f5461fb7-2ca1-4cf3-a6ba-2471a65322e9	ORD-20260701-00004	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	20.00	0.00	100.00	0.00	120.00	[]	\N	\N	\N	{"checkoutId": "2d5defe2-c150-4b9e-a7f8-ee9759164079", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 09:34:07.461	2026-07-01 09:34:07.461	\N	\N
8938d322-4dd4-48ae-8c07-449fc100f1dc	ORD-20260701-00006	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	200.00	0.00	100.00	0.00	300.00	[]	\N	\N	\N	{"checkoutId": "7852224e-11e1-4a91-92b4-2e27bd3cc82f", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 13:12:22.745	2026-07-01 13:12:22.745	\N	\N
25c4aa55-f46c-4682-b1d9-4e0ff866fa3a	ORD-20260701-00007	\N	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "karachi", "label": "", "state": "Sindh", "country": "PK", "lastName": "huzaifa", "firstName": "syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	180.00	0.00	100.00	0.00	280.00	[]	\N	\N	\N	{"checkoutId": "ded8cc05-82c0-4863-b60c-014c86298eb5", "shippingMethod": {"cost": 100, "currency": "PKR", "methodId": "67b1cc73-d1a5-4f53-acd2-a3489f62c963", "methodName": "Standard Shipping", "estimatedDays": 0}, "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 10}}	2026-07-01 14:51:54.079	2026-07-01 14:51:54.079	\N	\N
9acdce7c-b821-41f3-adaf-81a381bf62cc	ORD-20260819-00001	c2998d10-8ed5-423a-9bd2-c75f1ca2633a	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "KARACHI", "label": "", "phone": "03158567691", "state": "Sindh", "country": "PK", "lastName": "Huzaifa", "firstName": "Syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "KARACHI", "label": "", "phone": "03158567691", "state": "Sindh", "country": "PK", "lastName": "Huzaifa", "firstName": "Syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	1650.00	0.00	250.00	297.00	2197.00	[]	\N	\N	\N	{"checkoutId": "743cbabb-9abe-4cbe-bb6a-9290184e3b1d", "shippingMethod": {"cost": 250, "currency": "PKR", "methodId": "karachi_standard", "methodCode": "karachi_standard", "methodName": "Standard Karachi Delivery", "estimatedDays": 0}, "checkoutLineItems": [{"quantity": 3, "productId": "a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174", "variantId": "44ed96d0-8f82-4911-9a93-ab8eb6494607", "reservationId": "1b264c7e-1932-437d-8bc8-901d98c37692"}], "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 0}}	2026-08-19 08:26:12.442	2026-08-19 08:26:12.442	\N	\N
b30afca4-e29a-42af-9383-0eb534cf4ea3	ORD-20260819-00002	c2998d10-8ed5-423a-9bd2-c75f1ca2633a	8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8	pending	pending	unfulfilled	smhuzaifa525@gmail.com	\N	{"city": "HYDERABAD", "label": "", "phone": "03158567691", "state": "Sindh", "country": "PK", "lastName": "Huzaifa", "firstName": "Syed", "postalCode": "75740", "addressLine1": "baldia"}	{"city": "HYDERABAD", "label": "", "phone": "03158567691", "state": "Sindh", "country": "PK", "lastName": "Huzaifa", "firstName": "Syed", "postalCode": "75740", "addressLine1": "baldia"}	PKR	660.00	0.00	275.00	118.80	1053.80	[]	\N	\N	\N	{"checkoutId": "ffcb35be-cdd1-4780-b609-069f7c9dbaa3", "shippingMethod": {"cost": 275, "currency": "PKR", "methodId": "6f8e5a1d-9615-46ea-b203-bd111e6b780b", "methodCode": "economy_shipping", "methodName": "Economy Shipping", "estimatedDays": 0}, "checkoutLineItems": [{"quantity": 3, "productId": "9888d0bb-b6d8-47b7-8132-28dd4147cb43", "variantId": "4c3c762a-ef77-48cf-95d8-ca9781e23939", "reservationId": "8cfca004-b6fb-473a-b0a7-69e4abbe5d07"}], "customerGroupSnapshot": {"id": "8a31ee2d-11fe-4e3d-91db-c03e5a79a6b8", "name": "default", "taxClassId": null, "discountPercent": 0}}	2026-08-19 10:30:20.738	2026-08-19 10:30:20.738	\N	\N
\.


--
-- TOC entry 5662 (class 0 OID 21332)
-- Dependencies: 240
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, provider, flow_type, is_active, config, metadata, created_at, updated_at) FROM stdin;
1f3e4b70-63ff-4b05-a95f-e7b3612dc405	cod	Cash on Delivery	cod	OFFLINE	t	{}	{"sortOrder": 10}	2026-05-04 07:33:12.787	2026-07-29 09:18:04.447
\.


--
-- TOC entry 5663 (class 0 OID 21351)
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
6db61bab-54d5-44ff-a663-078ec5d1d27a	0f0ad1d2-5bd3-47cc-b386-c54b04e9a6b4	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	120.00	PKR	COD-9f6f00f4-f6e4-44b3-a01c-9f920b4457bc	\N	\N	{"orderId": "0f0ad1d2-5bd3-47cc-b386-c54b04e9a6b4", "orderNumber": "ORD-20260623-00001", "paymentMethod": "cod", "transactionId": "COD-9f6f00f4-f6e4-44b3-a01c-9f920b4457bc"}	\N	\N	\N	2026-06-23 07:29:46.028	2026-06-23 07:29:46.028
180faf5c-4e5d-4dd3-93b6-bed041512a0d	be31335b-e593-47e6-ad0d-db7435f45787	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	280.00	PKR	COD-5839d26c-6c8f-4f92-a1e1-f29b141b2644	\N	\N	{"orderId": "be31335b-e593-47e6-ad0d-db7435f45787", "orderNumber": "ORD-20260701-00001", "paymentMethod": "cod", "transactionId": "COD-5839d26c-6c8f-4f92-a1e1-f29b141b2644"}	\N	\N	\N	2026-07-01 06:12:36.67	2026-07-01 06:12:36.67
23365c30-f1fc-4100-bc7c-2c9bac69d139	c8b72004-95d3-49fe-80af-1fa8e8e9d744	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	120.00	PKR	COD-9a9855d6-1d0e-489a-9ea7-744416f77cdd	\N	\N	{"orderId": "c8b72004-95d3-49fe-80af-1fa8e8e9d744", "orderNumber": "ORD-20260701-00002", "paymentMethod": "cod", "transactionId": "COD-9a9855d6-1d0e-489a-9ea7-744416f77cdd"}	\N	\N	\N	2026-07-01 06:25:25.611	2026-07-01 06:25:25.611
d5015da2-5402-422c-aac9-17d6d5844322	374b0e7a-eae9-4532-a227-ef47e508ec56	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	280.00	PKR	COD-7a989591-772a-4e87-84f7-d15477cd0b9c	\N	\N	{"orderId": "374b0e7a-eae9-4532-a227-ef47e508ec56", "orderNumber": "ORD-20260701-00003", "paymentMethod": "cod", "transactionId": "COD-7a989591-772a-4e87-84f7-d15477cd0b9c"}	\N	\N	\N	2026-07-01 06:45:04.701	2026-07-01 06:45:04.701
7f97eed2-021d-4a67-8248-72d380755a1c	f5461fb7-2ca1-4cf3-a6ba-2471a65322e9	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	120.00	PKR	COD-03fed0ca-b78a-4385-8a3e-0b30b6a62c9b	\N	\N	{"orderId": "f5461fb7-2ca1-4cf3-a6ba-2471a65322e9", "orderNumber": "ORD-20260701-00004", "paymentMethod": "cod", "transactionId": "COD-03fed0ca-b78a-4385-8a3e-0b30b6a62c9b"}	\N	\N	\N	2026-07-01 09:34:07.693	2026-07-01 09:34:07.693
c6dae6d1-8675-46ce-8d9a-349185cf9e50	a78748f1-7095-49bc-bbdc-e413f1864323	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	200.00	PKR	COD-f6ab0b57-d9eb-4526-9ef6-0073e0aa8e82	\N	\N	{"orderId": "a78748f1-7095-49bc-bbdc-e413f1864323", "orderNumber": "ORD-20260701-00005", "paymentMethod": "cod", "transactionId": "COD-f6ab0b57-d9eb-4526-9ef6-0073e0aa8e82"}	\N	\N	\N	2026-07-01 09:43:57.153	2026-07-01 09:43:57.153
8fc31980-2344-420a-ae9c-cc6cd24d883f	8938d322-4dd4-48ae-8c07-449fc100f1dc	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	300.00	PKR	COD-25ee8d3e-0556-490e-8e2b-2954733dc5ee	\N	\N	{"orderId": "8938d322-4dd4-48ae-8c07-449fc100f1dc", "orderNumber": "ORD-20260701-00006", "paymentMethod": "cod", "transactionId": "COD-25ee8d3e-0556-490e-8e2b-2954733dc5ee"}	\N	\N	\N	2026-07-01 13:12:22.809	2026-07-01 13:12:22.809
81c3a942-4137-452f-b176-273b5cc8c1f9	25c4aa55-f46c-4682-b1d9-4e0ff866fa3a	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	280.00	PKR	COD-471b10e2-aa3c-420f-9444-9bc10e066169	\N	\N	{"orderId": "25c4aa55-f46c-4682-b1d9-4e0ff866fa3a", "orderNumber": "ORD-20260701-00007", "paymentMethod": "cod", "transactionId": "COD-471b10e2-aa3c-420f-9444-9bc10e066169"}	\N	\N	\N	2026-07-01 14:51:54.298	2026-07-01 14:51:54.298
b1016331-7c11-4141-8889-5641efe3388e	1e4620dd-bb44-4f87-b998-b45d76cca265	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	1055.82	PKR	COD-20812806-3705-46b0-9074-6df2368e19f4	\N	\N	{"orderId": "1e4620dd-bb44-4f87-b998-b45d76cca265", "orderNumber": "ORD-20260709-00001", "paymentMethod": "cod", "transactionId": "COD-20812806-3705-46b0-9074-6df2368e19f4"}	\N	\N	\N	2026-07-09 12:04:12.622	2026-07-09 12:04:12.622
aecc1510-6bc2-4637-b149-46546e860c55	9acdce7c-b821-41f3-adaf-81a381bf62cc	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	2197.00	PKR	COD-6a00e0ae-bce7-48fa-9fbc-2698301539b4	\N	\N	{"orderId": "9acdce7c-b821-41f3-adaf-81a381bf62cc", "orderNumber": "ORD-20260819-00001", "paymentMethod": "cod", "transactionId": "COD-6a00e0ae-bce7-48fa-9fbc-2698301539b4"}	\N	\N	\N	2026-08-19 08:26:12.543	2026-08-19 08:26:12.543
bb9543d2-a3fd-475e-9725-59e0eede9e2b	b30afca4-e29a-42af-9383-0eb534cf4ea3	1f3e4b70-63ff-4b05-a95f-e7b3612dc405	pending	OFFLINE	1053.80	PKR	COD-eb499e42-330a-4d97-8564-00b55e6c69ae	\N	\N	{"orderId": "b30afca4-e29a-42af-9383-0eb534cf4ea3", "orderNumber": "ORD-20260819-00002", "paymentMethod": "cod", "transactionId": "COD-eb499e42-330a-4d97-8564-00b55e6c69ae"}	\N	\N	\N	2026-08-19 10:30:20.848	2026-08-19 10:30:20.848
\.


--
-- TOC entry 5664 (class 0 OID 21368)
-- Dependencies: 242
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (product_id, category_id, "position") FROM stdin;
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	dbda699b-86f8-4b9b-9de0-b8729f96f00d	0
2c7e550f-32a1-465e-b974-f57f152838fb	dbda699b-86f8-4b9b-9de0-b8729f96f00d	1
185d2b70-8297-41cf-afc5-ee14fd38464a	dbda699b-86f8-4b9b-9de0-b8729f96f00d	2
3edc41b7-3996-4d29-8ece-a8282dd70fda	dbda699b-86f8-4b9b-9de0-b8729f96f00d	3
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	dbda699b-86f8-4b9b-9de0-b8729f96f00d	4
2f9be750-3d78-4030-8721-beca75a69b46	dbda699b-86f8-4b9b-9de0-b8729f96f00d	5
9888d0bb-b6d8-47b7-8132-28dd4147cb43	dbda699b-86f8-4b9b-9de0-b8729f96f00d	6
92c58ce2-1a3a-41a1-9200-b19472198647	dbda699b-86f8-4b9b-9de0-b8729f96f00d	7
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	dbda699b-86f8-4b9b-9de0-b8729f96f00d	8
93b883de-d033-4336-99bf-d802b93e700f	dbda699b-86f8-4b9b-9de0-b8729f96f00d	9
d9c95ec4-df7a-4778-86bb-c3818e8cac28	dbda699b-86f8-4b9b-9de0-b8729f96f00d	10
ad76bca0-acfc-45a6-91c7-1ef7099e9275	dbda699b-86f8-4b9b-9de0-b8729f96f00d	11
42881996-e1e9-48b5-bc90-7879faa68e99	dbda699b-86f8-4b9b-9de0-b8729f96f00d	12
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	dbda699b-86f8-4b9b-9de0-b8729f96f00d	13
2ca10703-c8c7-4688-94e8-ac1c930ad511	dbda699b-86f8-4b9b-9de0-b8729f96f00d	14
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	dbda699b-86f8-4b9b-9de0-b8729f96f00d	15
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	dbda699b-86f8-4b9b-9de0-b8729f96f00d	16
bed71484-1d2a-48b7-8947-2bba63063442	396fb3c1-3ef9-45f9-8944-9fe29ec83747	0
09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	396fb3c1-3ef9-45f9-8944-9fe29ec83747	1
c7d28472-8483-416b-908b-39bbd023e33e	396fb3c1-3ef9-45f9-8944-9fe29ec83747	2
f6fe519e-0c49-4287-b159-38fe55905c25	396fb3c1-3ef9-45f9-8944-9fe29ec83747	3
11920e18-2c21-473c-a201-54cfa6870a03	396fb3c1-3ef9-45f9-8944-9fe29ec83747	4
0019bc5a-cfda-423a-8033-04e19527878c	396fb3c1-3ef9-45f9-8944-9fe29ec83747	5
80f348a7-d613-4955-87c8-13b23f6034c6	12992097-98ae-4b19-a0ec-7552f6ab05bc	0
65777ded-ce30-4523-8c74-38c8f3c90e21	12992097-98ae-4b19-a0ec-7552f6ab05bc	1
d26afe56-30c5-4778-ad65-8d7fff9782f5	12992097-98ae-4b19-a0ec-7552f6ab05bc	2
8424893c-142f-4bbd-ad5f-72423b437023	12992097-98ae-4b19-a0ec-7552f6ab05bc	3
1b043109-6718-4011-b376-ac801a7aa13a	12992097-98ae-4b19-a0ec-7552f6ab05bc	4
426328ce-253f-4477-b6ad-0842c4f8da51	12992097-98ae-4b19-a0ec-7552f6ab05bc	5
aa5a044f-6947-42ac-88d2-19535c17ea2c	12992097-98ae-4b19-a0ec-7552f6ab05bc	6
ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	12992097-98ae-4b19-a0ec-7552f6ab05bc	7
3bb1a00d-202e-4c8d-8164-dce9b289a60d	12992097-98ae-4b19-a0ec-7552f6ab05bc	8
cada9aad-ebd1-4931-85db-1b5b6d43638a	12992097-98ae-4b19-a0ec-7552f6ab05bc	9
48d973ce-0795-4e24-9adb-d897c7d8d8a9	dfe9c40b-4923-4580-ab31-a7936e2c6981	0
703a281b-41db-4a68-9833-1726f52f77ac	dfe9c40b-4923-4580-ab31-a7936e2c6981	1
67adc18a-0b78-4b7e-9d85-791c11360d96	dfe9c40b-4923-4580-ab31-a7936e2c6981	2
0e953924-85eb-433e-aab8-172352c47c20	dfe9c40b-4923-4580-ab31-a7936e2c6981	3
f22228fb-4106-4dc0-8a63-b4e6093b8c28	dfe9c40b-4923-4580-ab31-a7936e2c6981	4
cafb9e6a-4403-4838-8235-1f2b976df6a8	c14b7d5e-37da-4b83-83c3-e7e55deb74ce	0
93d74064-c8a2-47bf-8eee-1065890b9787	c14b7d5e-37da-4b83-83c3-e7e55deb74ce	1
ff11dcac-4171-4d61-99a3-b2cc9d174de1	c14b7d5e-37da-4b83-83c3-e7e55deb74ce	2
2e6248be-15bb-45a8-8dc1-245118193c6f	c14b7d5e-37da-4b83-83c3-e7e55deb74ce	3
eaacdf54-eaa9-4dcc-839e-a10a61588523	c14b7d5e-37da-4b83-83c3-e7e55deb74ce	4
64289463-e48b-4261-bfef-e59b622eb20e	c14b7d5e-37da-4b83-83c3-e7e55deb74ce	5
\.


--
-- TOC entry 5665 (class 0 OID 21377)
-- Dependencies: 243
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, variant_id, url, alt_text, "position", is_primary, created_at) FROM stdin;
6c616091-8780-4d4f-8a61-ac42af2d4d82	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	\N	/uploads/products/3d904852-7d5d-4c89-83a4-7d5300aab02f.jpeg	Sweet Chewra	0	t	2026-08-14 12:19:38.963
0d08c733-057e-46fb-af36-07f92dfc7160	42881996-e1e9-48b5-bc90-7879faa68e99	\N	/uploads/products/d5ab3132-c317-403d-8805-7ac014aeda0b.jpeg	Papri Gathiya	0	t	2026-08-14 12:39:26.177
721f0c55-0d5b-4878-a6dd-90103853f2ef	0019bc5a-cfda-423a-8033-04e19527878c	\N	/uploads/products/4ba97cdc-d95b-47a3-94ed-94f1aaf41cdd.jpeg	Black Pepper Finger Chips	1	f	2026-08-14 12:48:30.506
b1271abb-7474-4018-80fe-69911f71a86c	f6fe519e-0c49-4287-b159-38fe55905c25	\N	/uploads/products/0b35549b-f475-40ce-9895-cc5546316f12.jpeg	Hyderabadi Chips	0	t	2026-08-14 12:54:26.207
0debb434-fc44-4048-a0ca-f54dc9cce711	09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	\N	/uploads/products/169ba96d-3ad6-481f-b1dc-7d8f27347690.jpeg	Spicy Crinkle Chips	0	t	2026-08-14 12:58:20.117
f20857fa-5d71-42a0-80c2-58a94a42c259	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	\N	/uploads/products/fdde003e-e638-4efc-8f82-6fc3ebbc7b05.jpeg	Dal Moong	1	f	2026-08-14 13:18:54.271
799ec57b-2bc4-4032-a0f8-3991a638a97f	9888d0bb-b6d8-47b7-8132-28dd4147cb43	\N	/uploads/products/56a23243-10e0-4b0c-8a58-574ce99fa0e0.jpeg	Dal Chana	0	t	2026-08-14 13:37:07.375
c6b08523-db94-4349-9854-7aabf6588d60	eb72e342-64df-4566-8029-db2c63859130	\N	/uploads/products/71451c33-cbd4-4a30-83b5-3f4145a8d49a.jpeg	Perfume Phenyl	0	t	2026-06-17 12:17:15.72
f0051af3-cf64-4513-a32f-9cde6f311d7e	eb72e342-64df-4566-8029-db2c63859130	\N	/uploads/products/38351eab-c533-4155-88e5-c3cb12ba13fa.jpeg	Perfume Phenyl	1	f	2026-06-17 12:18:41.938
d83698f0-c4a7-4bcc-8db5-e90843a81674	eb72e342-64df-4566-8029-db2c63859130	\N	/uploads/products/edba298e-061d-4caf-891d-88f95b3b6e9d.jpeg	Perfume Phenyl	2	f	2026-06-17 12:18:41.985
959dac31-b1ad-4f20-ae04-346419de033e	eb72e342-64df-4566-8029-db2c63859130	\N	/uploads/products/61521d6d-9278-4e54-a574-7d51fa91c4f8.jpeg	Perfume Phenyl	3	f	2026-06-17 12:18:42.03
b9cf1be8-29e0-4bdd-b356-6e858bc64c56	72c84214-a05b-40e8-9093-d76177afd8d9	\N	/uploads/products/70986ee9-fdb9-43f1-9cf6-0d6e61250ca8.jpeg	Toilet Bowl Cleaner	0	t	2026-06-17 12:21:11.58
93d9e533-28f4-413d-a800-393c2b0096e3	72c84214-a05b-40e8-9093-d76177afd8d9	\N	/uploads/products/12d4e364-6d9e-467f-b079-a6a36d129c92.jpeg	Toilet Bowl Cleaner	1	f	2026-06-17 12:21:32.633
28166f83-fe31-433b-8813-4279d291fa1d	5eaf65df-0faa-4975-be7b-6a2554a04f13	\N	/uploads/products/e2efe486-c41b-4700-879c-f2debc87b3fd.jpeg	Tile Wash	0	t	2026-06-17 12:22:31.416
55bf6489-92c8-4ea4-98f4-cd6fe59b0c47	5eaf65df-0faa-4975-be7b-6a2554a04f13	\N	/uploads/products/1e757918-a026-4b58-ae83-fbed6eb6e19b.jpeg	Tile Wash	1	f	2026-06-17 12:22:49.322
3d151832-4cd2-47a5-b5df-cff38010888f	230f5c47-5d61-4da1-adfc-6aa5d46f7111	\N	/uploads/products/de9655a5-c074-41b3-a932-01cb5f1ed10e.jpeg	Bleach Cleaner	0	t	2026-06-17 12:23:50.226
f7faaa6b-5348-480a-b3a6-6831b6cd0bab	230f5c47-5d61-4da1-adfc-6aa5d46f7111	\N	/uploads/products/b93b7fd3-0a20-4365-8a31-7743c041be78.jpeg	Bleach Cleaner	1	f	2026-06-17 12:24:48.093
473040c0-738c-4015-958e-844472b8ef53	df541ce1-98b2-49a0-8479-f5a9e1532a85	\N	/uploads/products/f1d3659c-e8a6-4841-b2ba-16dcad409431.jpeg	Glass Cleaner (Clean 360)	0	t	2026-06-17 12:27:56.757
f93f1914-0a7a-414c-9486-1dd6e6473604	df541ce1-98b2-49a0-8479-f5a9e1532a85	\N	/uploads/products/aa875cd4-2523-4a96-b0ef-537be7171948.jpeg	Glass Cleaner (Clean 360)	1	f	2026-06-17 12:28:09.307
a0f33223-b30e-4ea2-b68d-98178948db8e	b4366645-b14a-4de1-b621-e8776dc4f689	\N	/uploads/products/85d40ec1-22b4-41b3-b485-ce02a3f10a7b.jpeg	Panda Perfume Phenyl	0	t	2026-06-17 12:30:01.514
c22e7d14-910d-4ddd-9b2c-8c533c56e7f9	b4366645-b14a-4de1-b621-e8776dc4f689	\N	/uploads/products/5842750a-7a23-4618-aa15-28086e2637bf.jpeg	Panda Perfume Phenyl	1	f	2026-06-17 12:30:53.003
cda3df0f-31e7-48f2-a65a-f5b76d0db6e1	b4366645-b14a-4de1-b621-e8776dc4f689	\N	/uploads/products/1f919fca-d879-4996-80db-e9bbe547077d.jpeg	Panda Perfume Phenyl	2	f	2026-06-17 12:30:53.053
bd0d0ceb-c74c-4a6f-9e0a-7ce8c7399f6b	b4366645-b14a-4de1-b621-e8776dc4f689	\N	/uploads/products/866417a2-d561-4693-b4dc-de449ed6cce8.jpeg	Panda Perfume Phenyl	3	f	2026-06-17 12:30:53.097
0aa3ede3-47ea-4726-9712-47834aa605f6	2f9be750-3d78-4030-8721-beca75a69b46	\N	/uploads/products/7cbf2e8e-b1ec-473d-83b8-b0d6677f27e2.jpeg	Moti Bondi	0	t	2026-08-14 13:48:12.829
7fe4fa3c-1050-43e8-a9e6-bb3e341456bf	3edc41b7-3996-4d29-8ece-a8282dd70fda	\N	/uploads/products/19992648-23c2-4e7e-8462-9c44329e4622.jpeg	Mix Nimco	0	t	2026-08-14 14:02:35.15
3680b25a-973d-4450-b421-ec7f6af1ee8f	2c7e550f-32a1-465e-b974-f57f152838fb	\N	/uploads/products/e4ef2022-fc94-4b19-bb0e-d7bf6147d815.jpeg	Dal Moth	0	t	2026-08-15 20:04:51.015
d4a84868-f2e8-40d3-a960-5aa20c0ced29	93d74064-c8a2-47bf-8eee-1065890b9787	\N	/uploads/products/ea0356da-4c6e-44aa-8c2f-90b6893dce0f.jpeg	Masala Peanut	0	t	2026-08-15 20:09:01.583
52f03183-df84-4f46-bf3f-e8d3e3bd86dd	cafb9e6a-4403-4838-8235-1f2b976df6a8	\N	/uploads/products/6bcfaf0c-4c78-403a-b1c9-9640bebc0e01.jpeg	Coated Peanut	0	t	2026-08-15 20:11:10.479
a2c01c7a-79fd-4b22-89e9-245e7e26ee79	2e6248be-15bb-45a8-8dc1-245118193c6f	\N	/uploads/products/ac16425e-a5a7-44d0-8489-52f103a38527.jpeg	Chat Papri	1	f	2026-08-15 20:13:02.533
ac5a1220-8520-4584-99f9-febe034a4ad2	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	\N	/uploads/products/8e16e949-0d2c-4bba-8214-4f7bba34b620.jpeg	Bareek Gathiya	0	t	2026-08-15 20:16:20.633
201cafd5-196f-42ab-96d2-682c4dbd5689	aa5a044f-6947-42ac-88d2-19535c17ea2c	\N	/uploads/products/57b075f4-25ad-48f8-bdd9-f2d673695dff.jpeg	Khopra Pak	1	f	2026-08-15 21:51:40.982
da4ab351-8a1d-4925-b8f9-5532285ca010	426328ce-253f-4477-b6ad-0842c4f8da51	\N	/uploads/products/d5c5c824-250e-4fbc-8f31-464db2d9eed6.jpeg	Sohan Halwa	0	t	2026-08-15 21:53:34.807
8bf2e657-be23-4589-a985-41c855dc0316	1b043109-6718-4011-b376-ac801a7aa13a	\N	/uploads/products/3477f3ae-0e85-4a54-91f1-7a6e8067728a.jpeg	Karachi Halwa	0	t	2026-08-15 21:53:48.459
8dad823f-a69d-40e1-8f1e-05f35d9fb0d8	65777ded-ce30-4523-8c74-38c8f3c90e21	\N	/uploads/products/cc5fe764-7c77-4262-a3a5-584fabb972f7.jpeg	Kalakand	0	t	2026-08-15 21:55:48.219
88461e61-b4ff-4712-b36c-9d056b623821	f22228fb-4106-4dc0-8a63-b4e6093b8c28	\N	/uploads/products/b9622137-1012-4851-bb1e-de4a1e1e48d8.jpeg	Candy Rusk	0	t	2026-08-15 21:56:27.647
98b72f41-b10e-4805-9a8b-2ab7a6eca52a	8424893c-142f-4bbd-ad5f-72423b437023	\N	/uploads/products/72157580-efae-4702-939b-9652c31cc5b9.jpeg	Balu Shahi	0	t	2026-08-15 22:11:06.601
8c12b746-eb32-42d4-b0bc-44531c4cfade	703a281b-41db-4a68-9833-1726f52f77ac	\N	/uploads/products/d59a78bc-3a80-4014-98d4-3f3f60b7c909.jpeg	Slice Rusk	0	t	2026-08-15 22:16:04.81
ab060119-c774-4a3b-9d1a-98b530f50771	0e953924-85eb-433e-aab8-172352c47c20	\N	/uploads/products/9e290fd0-d990-44f8-a6b0-344f8befe373.jpeg	Burger Rusk	0	t	2026-08-15 22:16:45.428
db4d5c37-b6b0-4a3a-81bc-9431605f3b4f	b4366645-b14a-4de1-b621-e8776dc4f689	\N	/uploads/products/01445165-2334-4ed3-ad6e-328174e601f5.jpeg	Panda Perfume Phenyl	4	f	2026-06-17 12:30:53.139
02bf1856-c9ff-417d-afbe-ab67f884250f	03e5ef08-6883-4fd0-9583-94a2734aad9a	\N	/uploads/products/66da266a-d52b-46da-a138-77ad84696bef.jpeg	Panda Liquid Neel	0	t	2026-06-17 12:33:38.079
3f731fae-25f8-4520-a9bc-9e0f45a9f50c	03e5ef08-6883-4fd0-9583-94a2734aad9a	\N	/uploads/products/ebd5d91b-44db-4d5d-80f1-a5c82ddcf14a.jpeg	Panda Liquid Neel	1	f	2026-06-17 12:33:46.027
2396adb6-151b-4e8b-bbec-c2bccc61af94	07b2bf6a-2585-42f2-a7fd-ecc432b11861	\N	/uploads/products/251a93d2-b237-4bee-bdb3-07da60c6d035.jpeg	Cockroach Killer	0	t	2026-06-17 12:34:49.17
0ec0bf14-1758-4ebe-a35c-3f2872e20a6e	07b2bf6a-2585-42f2-a7fd-ecc432b11861	\N	/uploads/products/3bbd6059-9dcb-4a47-9725-8abe84286714.jpeg	Cockroach Killer	1	f	2026-06-17 12:34:59.264
b8e6e12b-bed3-4e90-8c1d-1a78f8088e99	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	\N	/uploads/products/8e8d394e-aab0-4c74-8390-41ea4845f784.jpeg	Clean360 Bleach Exra Strong	0	t	2026-06-17 12:36:13.727
4e24fb17-99ba-4d67-8c0d-54cebde0d617	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	\N	/uploads/products/8c42fb20-dea6-43ee-a657-a107d153a0a7.jpeg	Clean360 Bleach Exra Strong	1	f	2026-06-17 12:36:19.344
0073c047-db73-48d5-96fc-0c079c9424c2	09cfaa0d-9088-4e2d-823e-3ad80af8853b	\N	/uploads/products/0c2e39fe-26c3-416f-8cd0-72747aa624be.jpeg	Sweep-o Floor & Tile Cleaner	0	t	2026-06-17 12:37:49.904
80e874da-6b48-4ca1-9f89-f8910de05d0d	09cfaa0d-9088-4e2d-823e-3ad80af8853b	\N	/uploads/products/9dfb637c-8990-4732-8746-6c5f754c10d9.jpeg	Sweep-o Floor & Tile Cleaner	1	f	2026-06-17 12:38:07.53
557101a9-17a0-4a40-8fa3-7e0fb2415c2b	2881ef70-d26b-4da5-af06-9e0c5795fee4	\N	/uploads/products/2f73209e-0c72-4a77-ade9-8f2bbf5fa46a.jpeg	Dish Wash Liquid	0	t	2026-06-17 12:40:11.362
46e3876c-15f0-4fa7-9ac0-7111fbf6c438	2881ef70-d26b-4da5-af06-9e0c5795fee4	\N	/uploads/products/27fd70c6-7bb4-4988-9add-db66559a77a7.jpeg	Dish Wash Liquid	1	f	2026-06-17 12:40:26.294
257bbbf4-f00b-4266-9721-a78fb90433f5	1f87d70a-7fb5-43e9-a41c-87b29873a33b	\N	/uploads/products/f75f64db-05ba-4ef6-82b6-855acf3a2e68.jpeg	Super Sony	0	t	2026-06-17 12:42:28.871
c079e621-3be1-4f13-8716-cf3e6fccc6ba	1f87d70a-7fb5-43e9-a41c-87b29873a33b	\N	/uploads/products/b02cb0cb-2939-47b3-a126-60dcc2dac186.jpeg	Super Sony	1	f	2026-06-17 12:42:41.98
411d8c27-1331-4968-846b-d1bcf01a355c	1f87d70a-7fb5-43e9-a41c-87b29873a33b	\N	/uploads/products/f7768c74-fe25-4c4c-b389-7dbff39a9806.jpeg	Super Sony	2	f	2026-06-17 12:42:42.029
13c767e6-e16f-4792-bd91-e52d5ee564e4	90792798-2b85-4423-8eba-e7f12c64617d	\N	/uploads/products/451ccb4f-99dc-408c-bd90-f5d75263afdf.jpeg	777 Sony Dish Wash Soap	0	t	2026-06-17 12:44:44.044
7f54a276-f3f9-4fd2-93d2-fea01d6b6673	90792798-2b85-4423-8eba-e7f12c64617d	\N	/uploads/products/b1b1d873-2877-43b9-ad15-34a28ec2ca0a.jpeg	777 Sony Dish Wash Soap	1	f	2026-06-17 12:44:50.393
7f3d6fcd-2d8f-4df1-a838-3f2f7a8912cf	05268a8c-518a-4ff4-8691-3cfdff054382	\N	/uploads/products/3e6b240a-52d2-4dfd-88b7-67de8376d54b.jpeg	Dish Wash Scourer	0	t	2026-06-17 12:46:19.191
4fa3401b-150f-40f0-975e-2cffa4800a85	05268a8c-518a-4ff4-8691-3cfdff054382	\N	/uploads/products/77ecf402-9549-4c21-9695-e028c8d6b830.jpeg	Dish Wash Scourer	1	f	2026-06-17 12:46:26.557
cc22ab1e-5558-42fd-8ab0-9d096392a277	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	\N	/uploads/products/96595421-4854-4992-9311-a82662a2239d.jpeg	Salted Slims	0	t	2026-08-14 12:26:45.557
360d73cd-f2c0-41c6-a94f-d6ff1cbda3f8	ad76bca0-acfc-45a6-91c7-1ef7099e9275	\N	/uploads/products/29577836-ee4e-45f6-bcd7-d6010ececad8.jpeg	Gathiya	0	t	2026-08-14 12:42:50.806
9409bc4e-64f0-48ac-b485-71ba8da44afd	d9c95ec4-df7a-4778-86bb-c3818e8cac28	\N	/uploads/products/ae139e9a-3cd4-4b2b-a485-eb3b69a2d421.jpeg	Bareek Sev	0	t	2026-08-14 12:46:32.202
ab474d67-971a-4ba9-8b1d-f62eca0ac7eb	11920e18-2c21-473c-a201-54cfa6870a03	\N	/uploads/products/1a2a44e6-4a21-4a3d-89af-05f5f5b7805a.jpeg	Crinkle Chips Ketchup	1	f	2026-08-14 12:52:36.992
1f7a2958-f67f-4d7a-a70a-0dfbe98c62f4	c7d28472-8483-416b-908b-39bbd023e33e	\N	/uploads/products/1981a3c2-b897-4498-afc3-5a5b2bd5290f.jpeg	Masala Chips	0	t	2026-08-14 12:56:27.746
98fefb6a-9758-4a83-b0de-826fe22b5910	93b883de-d033-4336-99bf-d802b93e700f	\N	/uploads/products/6a881682-27ef-464a-9324-5a13c5b8b088.jpeg	Bhel Puri	0	t	2026-08-14 12:59:50.262
6a8d702c-ac55-4570-9891-d1f2f7f3f4d9	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	\N	/uploads/products/640d59ee-490f-4589-864a-4e732a431853.jpeg	Bareek Bondi	0	t	2026-08-14 13:32:41.483
7b919c5f-47b7-44ed-90d9-0490981b3947	92c58ce2-1a3a-41a1-9200-b19472198647	\N	/uploads/products/ab45d6bb-892b-4411-825e-51c49d0b0512.jpeg	Lakri Gathiya	0	t	2026-08-14 13:34:41.491
1f6fa656-14f2-49e5-91b6-6b61fe7e7f87	2ca10703-c8c7-4688-94e8-ac1c930ad511	\N	/uploads/products/615f2d79-d4a0-4a7b-b362-dc49bb0224a5.jpeg	Chewra	1	f	2026-08-14 13:41:14.258
c93b5588-d3cc-4e73-bd07-0757b94cd025	ff11dcac-4171-4d61-99a3-b2cc9d174de1	\N	/uploads/products/f1ececd9-2e08-41fe-8752-f7ed11533590.jpeg	Chavani Papri	0	t	2026-08-14 13:44:49.706
6b0f9683-7eae-4702-b06b-a07cbb10820c	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	\N	/uploads/products/b6129ef3-db52-40dc-b552-4a89e58cea1b.jpeg	Shakar Pare	0	t	2026-08-14 13:55:35.416
976e1387-faa0-4657-9302-e60c0edd1be7	185d2b70-8297-41cf-afc5-ee14fd38464a	\N	/uploads/products/07bdd870-a7fc-4098-9a78-213f8c0620d7.jpeg	Spicy Slims	0	t	2026-08-15 20:06:30.465
aee6d839-ec84-4419-a544-9eb15fe9c2c1	eaacdf54-eaa9-4dcc-839e-a10a61588523	\N	/uploads/products/c09d7425-c437-4ece-842f-fd368b3c1120.jpeg	Salted Peanuts	1	f	2026-08-15 20:09:44.934
2622d876-4891-448f-b24d-018502ac93ea	bed71484-1d2a-48b7-8947-2bba63063442	\N	/uploads/products/e7c849c1-e319-47da-af93-9ff746e75524.jpeg	Salted Chips	0	t	2026-08-15 20:15:10.607
adf2e160-0300-4b51-8552-27419ae4edf3	cada9aad-ebd1-4931-85db-1b5b6d43638a	\N	/uploads/products/3d8dec00-e4ab-4687-a47d-8d80b0896d7f.jpeg	Khoya Pera	0	t	2026-08-15 21:50:31.857
0620c6b2-3ec4-4630-ac33-ef397c0297b4	3bb1a00d-202e-4c8d-8164-dce9b289a60d	\N	/uploads/products/1207ab1e-a2aa-4db8-9d74-b069660c7f39.jpeg	Monthar	0	t	2026-08-15 21:50:58.042
502a5568-d5fb-4b2c-860e-4b9009baae4e	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	\N	/uploads/products/aa124c35-f71f-48e3-a27d-f399660c7b6f.jpeg	Bondi Laddu	0	t	2026-08-15 21:51:15.5
4929fd54-f700-4478-bfaf-24bede9ba4a4	d26afe56-30c5-4778-ad65-8d7fff9782f5	\N	/uploads/products/c2366d43-2021-4a24-ac4d-6b08c89848f9.jpeg	Malai Khaja	0	t	2026-08-15 21:54:06.656
6c220a72-c7be-48f1-8cd9-d6a085a878eb	80f348a7-d613-4955-87c8-13b23f6034c6	\N	/uploads/products/7669a8c8-cb43-4474-8afd-bf78d159acf8.jpeg	Egg Mesoo	0	t	2026-08-15 21:56:07.961
4b56262d-1692-457b-a884-687c8b87d7d1	64289463-e48b-4261-bfef-e59b622eb20e	\N	/uploads/products/e2cfa7f2-51bf-4d33-8047-c6fcc8f39c4b.jpeg	Salanty	1	f	2026-08-15 22:04:42.484
c5a5565b-2da8-40b4-97b6-e0d6b63651b4	48d973ce-0795-4e24-9adb-d897c7d8d8a9	\N	/uploads/products/2df2af91-06ac-43c1-b44d-b31c4d1a2a15.jpeg	Peanut Rusk	0	t	2026-08-15 22:15:49.997
d84a1f52-542b-45d0-bcc4-565560fb8026	67adc18a-0b78-4b7e-9d85-791c11360d96	\N	/uploads/products/1e865042-c008-4d0d-bfe7-cda0717d0053.jpeg	Gol Rusk	0	t	2026-08-15 22:16:31.448
\.


--
-- TOC entry 5666 (class 0 OID 21391)
-- Dependencies: 244
-- Data for Name: product_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values (id, option_id, value, code, sort_order, is_active, created_at, updated_at) FROM stdin;
500b45bd-6add-4bb4-80dc-d88f8ee46cc7	d06da49b-297e-48d0-bead-f36769d3472e	250gram	\N	5	t	2026-08-09 21:19:41.947	2026-08-09 21:23:06.107
2583ce01-e9d6-41c6-997d-03085c3a6b92	d06da49b-297e-48d0-bead-f36769d3472e	400gram	\N	6	t	2026-08-09 21:19:52.21	2026-08-09 21:23:17.243
83a2dbc1-7521-4ccc-973d-8662901ba911	d06da49b-297e-48d0-bead-f36769d3472e	500gram	\N	7	t	2026-08-09 21:20:05.927	2026-08-09 21:23:24.639
91979004-6cae-4a76-9ff5-9444026de0f6	d06da49b-297e-48d0-bead-f36769d3472e	1kg	\N	8	t	2026-08-09 21:23:33.481	2026-08-09 21:23:33.481
fa23f3b2-3bcf-4652-b494-6ff78e79ad90	e1f64031-b4bd-4e22-9d3a-b284ed0d9d9f	masala	\N	1	t	2026-08-09 21:26:45.793	2026-08-09 21:26:45.793
5fedeb65-05ba-4948-ac9f-1ed6d7955bad	e1f64031-b4bd-4e22-9d3a-b284ed0d9d9f	salty	\N	0	t	2026-08-09 21:26:34.868	2026-08-09 21:27:01.97
52c75bc7-afe5-4de6-bc94-09c4be31cf87	e1f64031-b4bd-4e22-9d3a-b284ed0d9d9f	coated	\N	3	t	2026-08-09 21:27:12.947	2026-08-09 21:29:02.868
8d08a412-f8c3-4162-a3b8-5ec78ed50df5	a39db598-111e-4007-bf54-f564b2c1f587	Finger Chips	\N	4	t	2026-08-09 21:33:15.818	2026-08-09 21:33:15.818
325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7	a39db598-111e-4007-bf54-f564b2c1f587	1Pack	\N	0	t	2026-08-10 15:42:38.918	2026-08-10 15:42:38.918
5e786f0a-07ee-458a-906a-019acd81a416	40b86c40-f78a-4c90-9fab-1eb3a477e214	Chips	\N	0	t	2026-07-23 10:38:09.007	2026-07-29 09:18:04.687
8c8b263f-dba4-4754-a27e-09f7968d247f	40b86c40-f78a-4c90-9fab-1eb3a477e214	Salanty	\N	1	t	2026-07-23 10:38:19.817	2026-07-29 09:18:04.691
c2c9955d-db73-4b9a-a3ca-a144331447e9	40b86c40-f78a-4c90-9fab-1eb3a477e214	Daal	\N	2	t	2026-07-23 10:38:51.461	2026-07-29 09:18:04.694
ac28f807-f7c2-4e8a-b754-5a6ab600e6ca	40b86c40-f78a-4c90-9fab-1eb3a477e214	Papri	\N	3	t	2026-07-23 10:39:23.137	2026-07-29 09:18:04.697
05511a18-deb7-4361-a8b8-27dd2c596af3	40b86c40-f78a-4c90-9fab-1eb3a477e214	Chewra	\N	4	t	2026-07-23 10:39:38.022	2026-07-29 09:18:04.699
f31500be-256c-4b03-9d06-7e89b784df4e	40b86c40-f78a-4c90-9fab-1eb3a477e214	Peanuts	\N	5	t	2026-07-23 10:39:59.783	2026-07-29 09:18:04.701
08b9ab65-eba3-4875-a761-485f6196f74e	a39db598-111e-4007-bf54-f564b2c1f587	1Pcs	1pcs	0	t	2026-06-17 13:03:55.272	2026-07-29 09:18:04.704
98acf219-fadc-4e60-88f9-3b660145230d	a39db598-111e-4007-bf54-f564b2c1f587	Family pack	family pack	1	t	2026-05-08 06:44:01.979	2026-07-29 09:18:04.706
d79e5779-4b44-422c-bcb0-43743dba8196	a39db598-111e-4007-bf54-f564b2c1f587	Pack of 3	pack of 3	3	t	2026-05-08 06:46:44.189	2026-07-29 09:18:04.708
3a83fd97-e566-44d0-9d6d-ab568bae9f69	d06da49b-297e-48d0-bead-f36769d3472e	80gram	\N	0	t	2026-08-09 21:17:51.503	2026-08-09 21:17:51.503
6675f571-9c67-4158-86a4-a80afbeea01a	d06da49b-297e-48d0-bead-f36769d3472e	100gram	\N	1	t	2026-08-09 21:18:06.445	2026-08-09 21:18:06.445
20f4ffb2-f54d-49c6-83b9-0379a446e08d	d06da49b-297e-48d0-bead-f36769d3472e	160gram	\N	2	t	2026-08-09 21:18:15.909	2026-08-09 21:18:15.909
047e43eb-fee5-43fe-a196-a0693d6b5464	d06da49b-297e-48d0-bead-f36769d3472e	180gram	\N	3	t	2026-08-09 21:18:27.232	2026-08-09 21:19:21.519
45f08eac-42f5-4f20-9b64-e229f75c4df4	d06da49b-297e-48d0-bead-f36769d3472e	200gram	\N	4	t	2026-08-09 21:18:48.371	2026-08-09 21:19:29.055
40031c52-0288-4c97-8fcc-1670b5ad4dbd	d06da49b-297e-48d0-bead-f36769d3472e	half kg	\N	0	t	2026-08-09 21:21:38.662	2026-08-09 21:21:50.099
b1129a0b-6c8e-47f7-aa9d-0a2ca96445c5	d06da49b-297e-48d0-bead-f36769d3472e	30gram	\N	0	t	2026-08-09 21:21:59.275	2026-08-09 21:21:59.275
\.


--
-- TOC entry 5667 (class 0 OID 21406)
-- Dependencies: 245
-- Data for Name: product_option_values_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values_on_products (product_id, option_id, value_id) FROM stdin;
05268a8c-518a-4ff4-8691-3cfdff054382	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
f22228fb-4106-4dc0-8a63-b4e6093b8c28	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
0e953924-85eb-433e-aab8-172352c47c20	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
67adc18a-0b78-4b7e-9d85-791c11360d96	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
07b2bf6a-2585-42f2-a7fd-ecc432b11861	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
703a281b-41db-4a68-9833-1726f52f77ac	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
48d973ce-0795-4e24-9adb-d897c7d8d8a9	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
90792798-2b85-4423-8eba-e7f12c64617d	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
64289463-e48b-4261-bfef-e59b622eb20e	d06da49b-297e-48d0-bead-f36769d3472e	b1129a0b-6c8e-47f7-aa9d-0a2ca96445c5
11920e18-2c21-473c-a201-54cfa6870a03	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
11920e18-2c21-473c-a201-54cfa6870a03	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
2e6248be-15bb-45a8-8dc1-245118193c6f	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
2ca10703-c8c7-4688-94e8-ac1c930ad511	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
42881996-e1e9-48b5-bc90-7879faa68e99	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
42881996-e1e9-48b5-bc90-7879faa68e99	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
42881996-e1e9-48b5-bc90-7879faa68e99	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
42881996-e1e9-48b5-bc90-7879faa68e99	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
42881996-e1e9-48b5-bc90-7879faa68e99	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
ad76bca0-acfc-45a6-91c7-1ef7099e9275	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
ad76bca0-acfc-45a6-91c7-1ef7099e9275	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
ad76bca0-acfc-45a6-91c7-1ef7099e9275	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
ad76bca0-acfc-45a6-91c7-1ef7099e9275	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
ad76bca0-acfc-45a6-91c7-1ef7099e9275	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
d9c95ec4-df7a-4778-86bb-c3818e8cac28	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
d9c95ec4-df7a-4778-86bb-c3818e8cac28	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
d9c95ec4-df7a-4778-86bb-c3818e8cac28	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
d9c95ec4-df7a-4778-86bb-c3818e8cac28	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
d9c95ec4-df7a-4778-86bb-c3818e8cac28	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
0019bc5a-cfda-423a-8033-04e19527878c	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
0019bc5a-cfda-423a-8033-04e19527878c	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
f6fe519e-0c49-4287-b159-38fe55905c25	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
f6fe519e-0c49-4287-b159-38fe55905c25	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
c7d28472-8483-416b-908b-39bbd023e33e	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
c7d28472-8483-416b-908b-39bbd023e33e	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
93b883de-d033-4336-99bf-d802b93e700f	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
93b883de-d033-4336-99bf-d802b93e700f	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
93b883de-d033-4336-99bf-d802b93e700f	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
93b883de-d033-4336-99bf-d802b93e700f	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
93b883de-d033-4336-99bf-d802b93e700f	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
92c58ce2-1a3a-41a1-9200-b19472198647	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
92c58ce2-1a3a-41a1-9200-b19472198647	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
92c58ce2-1a3a-41a1-9200-b19472198647	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
92c58ce2-1a3a-41a1-9200-b19472198647	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
92c58ce2-1a3a-41a1-9200-b19472198647	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
9888d0bb-b6d8-47b7-8132-28dd4147cb43	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
9888d0bb-b6d8-47b7-8132-28dd4147cb43	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
9888d0bb-b6d8-47b7-8132-28dd4147cb43	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
9888d0bb-b6d8-47b7-8132-28dd4147cb43	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
9888d0bb-b6d8-47b7-8132-28dd4147cb43	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
2f9be750-3d78-4030-8721-beca75a69b46	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
2f9be750-3d78-4030-8721-beca75a69b46	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
2f9be750-3d78-4030-8721-beca75a69b46	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
2f9be750-3d78-4030-8721-beca75a69b46	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
2f9be750-3d78-4030-8721-beca75a69b46	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
3edc41b7-3996-4d29-8ece-a8282dd70fda	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
3edc41b7-3996-4d29-8ece-a8282dd70fda	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
3edc41b7-3996-4d29-8ece-a8282dd70fda	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
3edc41b7-3996-4d29-8ece-a8282dd70fda	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
3edc41b7-3996-4d29-8ece-a8282dd70fda	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
2c7e550f-32a1-465e-b974-f57f152838fb	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
2c7e550f-32a1-465e-b974-f57f152838fb	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
2c7e550f-32a1-465e-b974-f57f152838fb	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
2c7e550f-32a1-465e-b974-f57f152838fb	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
2c7e550f-32a1-465e-b974-f57f152838fb	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
185d2b70-8297-41cf-afc5-ee14fd38464a	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
185d2b70-8297-41cf-afc5-ee14fd38464a	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
185d2b70-8297-41cf-afc5-ee14fd38464a	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
185d2b70-8297-41cf-afc5-ee14fd38464a	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
185d2b70-8297-41cf-afc5-ee14fd38464a	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
93d74064-c8a2-47bf-8eee-1065890b9787	d06da49b-297e-48d0-bead-f36769d3472e	047e43eb-fee5-43fe-a196-a0693d6b5464
eaacdf54-eaa9-4dcc-839e-a10a61588523	d06da49b-297e-48d0-bead-f36769d3472e	047e43eb-fee5-43fe-a196-a0693d6b5464
cafb9e6a-4403-4838-8235-1f2b976df6a8	d06da49b-297e-48d0-bead-f36769d3472e	047e43eb-fee5-43fe-a196-a0693d6b5464
bed71484-1d2a-48b7-8947-2bba63063442	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
bed71484-1d2a-48b7-8947-2bba63063442	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
ff11dcac-4171-4d61-99a3-b2cc9d174de1	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
ff11dcac-4171-4d61-99a3-b2cc9d174de1	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
80f348a7-d613-4955-87c8-13b23f6034c6	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
80f348a7-d613-4955-87c8-13b23f6034c6	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
80f348a7-d613-4955-87c8-13b23f6034c6	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
65777ded-ce30-4523-8c74-38c8f3c90e21	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
65777ded-ce30-4523-8c74-38c8f3c90e21	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
65777ded-ce30-4523-8c74-38c8f3c90e21	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
d26afe56-30c5-4778-ad65-8d7fff9782f5	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
d26afe56-30c5-4778-ad65-8d7fff9782f5	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
d26afe56-30c5-4778-ad65-8d7fff9782f5	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
8424893c-142f-4bbd-ad5f-72423b437023	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
8424893c-142f-4bbd-ad5f-72423b437023	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
8424893c-142f-4bbd-ad5f-72423b437023	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
1b043109-6718-4011-b376-ac801a7aa13a	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
1b043109-6718-4011-b376-ac801a7aa13a	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
1b043109-6718-4011-b376-ac801a7aa13a	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
426328ce-253f-4477-b6ad-0842c4f8da51	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
426328ce-253f-4477-b6ad-0842c4f8da51	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
426328ce-253f-4477-b6ad-0842c4f8da51	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
aa5a044f-6947-42ac-88d2-19535c17ea2c	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
aa5a044f-6947-42ac-88d2-19535c17ea2c	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
aa5a044f-6947-42ac-88d2-19535c17ea2c	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
3bb1a00d-202e-4c8d-8164-dce9b289a60d	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
3bb1a00d-202e-4c8d-8164-dce9b289a60d	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
3bb1a00d-202e-4c8d-8164-dce9b289a60d	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
cada9aad-ebd1-4931-85db-1b5b6d43638a	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
cada9aad-ebd1-4931-85db-1b5b6d43638a	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
cada9aad-ebd1-4931-85db-1b5b6d43638a	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
\.


--
-- TOC entry 5668 (class 0 OID 21414)
-- Dependencies: 246
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options (id, name, code, is_active, created_at, updated_at) FROM stdin;
40b86c40-f78a-4c90-9fab-1eb3a477e214	Items	item	t	2026-06-17 07:39:30.545	2026-07-29 09:18:04.683
a39db598-111e-4007-bf54-f564b2c1f587	Pack	pack	t	2026-05-08 06:43:46.941	2026-07-29 09:18:04.703
d06da49b-297e-48d0-bead-f36769d3472e	weight	w	t	2026-08-09 21:17:35.77	2026-08-09 21:17:35.77
e1f64031-b4bd-4e22-9d3a-b284ed0d9d9f	variety	v	t	2026-08-09 21:26:23.049	2026-08-09 21:26:23.049
\.


--
-- TOC entry 5669 (class 0 OID 21427)
-- Dependencies: 247
-- Data for Name: product_options_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options_on_products (product_id, option_id, is_required, "position") FROM stdin;
1f87d70a-7fb5-43e9-a41c-87b29873a33b	a39db598-111e-4007-bf54-f564b2c1f587	t	0
05268a8c-518a-4ff4-8691-3cfdff054382	a39db598-111e-4007-bf54-f564b2c1f587	t	0
07b2bf6a-2585-42f2-a7fd-ecc432b11861	a39db598-111e-4007-bf54-f564b2c1f587	t	0
03e5ef08-6883-4fd0-9583-94a2734aad9a	a39db598-111e-4007-bf54-f564b2c1f587	t	0
df541ce1-98b2-49a0-8479-f5a9e1532a85	a39db598-111e-4007-bf54-f564b2c1f587	t	0
90792798-2b85-4423-8eba-e7f12c64617d	a39db598-111e-4007-bf54-f564b2c1f587	t	0
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	d06da49b-297e-48d0-bead-f36769d3472e	t	0
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	d06da49b-297e-48d0-bead-f36769d3472e	t	0
92c58ce2-1a3a-41a1-9200-b19472198647	d06da49b-297e-48d0-bead-f36769d3472e	t	0
9888d0bb-b6d8-47b7-8132-28dd4147cb43	d06da49b-297e-48d0-bead-f36769d3472e	t	0
2f9be750-3d78-4030-8721-beca75a69b46	d06da49b-297e-48d0-bead-f36769d3472e	t	0
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	d06da49b-297e-48d0-bead-f36769d3472e	t	0
3edc41b7-3996-4d29-8ece-a8282dd70fda	d06da49b-297e-48d0-bead-f36769d3472e	t	0
2c7e550f-32a1-465e-b974-f57f152838fb	d06da49b-297e-48d0-bead-f36769d3472e	t	0
185d2b70-8297-41cf-afc5-ee14fd38464a	d06da49b-297e-48d0-bead-f36769d3472e	t	0
93d74064-c8a2-47bf-8eee-1065890b9787	d06da49b-297e-48d0-bead-f36769d3472e	t	0
eaacdf54-eaa9-4dcc-839e-a10a61588523	d06da49b-297e-48d0-bead-f36769d3472e	t	0
cafb9e6a-4403-4838-8235-1f2b976df6a8	d06da49b-297e-48d0-bead-f36769d3472e	t	0
bed71484-1d2a-48b7-8947-2bba63063442	d06da49b-297e-48d0-bead-f36769d3472e	t	0
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	d06da49b-297e-48d0-bead-f36769d3472e	t	0
ff11dcac-4171-4d61-99a3-b2cc9d174de1	d06da49b-297e-48d0-bead-f36769d3472e	t	0
cada9aad-ebd1-4931-85db-1b5b6d43638a	d06da49b-297e-48d0-bead-f36769d3472e	t	0
80f348a7-d613-4955-87c8-13b23f6034c6	d06da49b-297e-48d0-bead-f36769d3472e	t	0
65777ded-ce30-4523-8c74-38c8f3c90e21	d06da49b-297e-48d0-bead-f36769d3472e	t	0
d26afe56-30c5-4778-ad65-8d7fff9782f5	d06da49b-297e-48d0-bead-f36769d3472e	t	0
8424893c-142f-4bbd-ad5f-72423b437023	d06da49b-297e-48d0-bead-f36769d3472e	t	0
1b043109-6718-4011-b376-ac801a7aa13a	d06da49b-297e-48d0-bead-f36769d3472e	t	0
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	d06da49b-297e-48d0-bead-f36769d3472e	t	0
64289463-e48b-4261-bfef-e59b622eb20e	d06da49b-297e-48d0-bead-f36769d3472e	f	0
11920e18-2c21-473c-a201-54cfa6870a03	d06da49b-297e-48d0-bead-f36769d3472e	t	0
2e6248be-15bb-45a8-8dc1-245118193c6f	d06da49b-297e-48d0-bead-f36769d3472e	t	0
2ca10703-c8c7-4688-94e8-ac1c930ad511	d06da49b-297e-48d0-bead-f36769d3472e	t	0
f22228fb-4106-4dc0-8a63-b4e6093b8c28	a39db598-111e-4007-bf54-f564b2c1f587	t	0
0e953924-85eb-433e-aab8-172352c47c20	a39db598-111e-4007-bf54-f564b2c1f587	t	0
67adc18a-0b78-4b7e-9d85-791c11360d96	a39db598-111e-4007-bf54-f564b2c1f587	t	0
703a281b-41db-4a68-9833-1726f52f77ac	a39db598-111e-4007-bf54-f564b2c1f587	t	0
48d973ce-0795-4e24-9adb-d897c7d8d8a9	a39db598-111e-4007-bf54-f564b2c1f587	t	0
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	d06da49b-297e-48d0-bead-f36769d3472e	t	0
42881996-e1e9-48b5-bc90-7879faa68e99	d06da49b-297e-48d0-bead-f36769d3472e	t	0
ad76bca0-acfc-45a6-91c7-1ef7099e9275	d06da49b-297e-48d0-bead-f36769d3472e	t	0
d9c95ec4-df7a-4778-86bb-c3818e8cac28	d06da49b-297e-48d0-bead-f36769d3472e	t	0
0019bc5a-cfda-423a-8033-04e19527878c	d06da49b-297e-48d0-bead-f36769d3472e	t	0
f6fe519e-0c49-4287-b159-38fe55905c25	d06da49b-297e-48d0-bead-f36769d3472e	t	0
c7d28472-8483-416b-908b-39bbd023e33e	d06da49b-297e-48d0-bead-f36769d3472e	t	0
09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	d06da49b-297e-48d0-bead-f36769d3472e	t	0
93b883de-d033-4336-99bf-d802b93e700f	d06da49b-297e-48d0-bead-f36769d3472e	t	0
426328ce-253f-4477-b6ad-0842c4f8da51	d06da49b-297e-48d0-bead-f36769d3472e	t	0
aa5a044f-6947-42ac-88d2-19535c17ea2c	d06da49b-297e-48d0-bead-f36769d3472e	t	0
ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	d06da49b-297e-48d0-bead-f36769d3472e	t	0
3bb1a00d-202e-4c8d-8164-dce9b289a60d	d06da49b-297e-48d0-bead-f36769d3472e	t	0
\.


--
-- TOC entry 5670 (class 0 OID 21438)
-- Dependencies: 248
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, sku, name, price, cost, weight, attributes, "position", is_active, created_at, updated_at, shipping_weight, shipping_weight_unit) FROM stdin;
fdf241e4-b0d0-456e-8da6-eef5c1124666	eb72e342-64df-4566-8029-db2c63859130	SKU-008-ROSE	Flavour: Rose	120.00	\N	\N	{"optionValues": {"flavour": "Rose"}, "optionValueIds": {"flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	0	t	2026-06-17 12:19:55.8	2026-06-17 12:19:55.8	1	KG
c36c179e-c2af-4e00-beea-dfd8a3cdec2c	eb72e342-64df-4566-8029-db2c63859130	SKU-008-LEVANDER	Flavour: Levander	120.00	\N	\N	{"optionValues": {"flavour": "Levander"}, "optionValueIds": {"flavour": "edcb2d16-3ef8-46ed-84c0-b55925836025"}}	1	t	2026-06-17 12:19:55.815	2026-06-17 12:19:55.815	1	KG
663e25b8-ac9e-4892-b47c-c2e9514ef716	eb72e342-64df-4566-8029-db2c63859130	SKU-008-WHITE	Flavour: White	120.00	\N	\N	{"optionValues": {"flavour": "White"}, "optionValueIds": {"flavour": "adda47fd-5c46-4ebf-8a6e-133548aba59e"}}	2	t	2026-06-17 12:19:55.821	2026-06-17 12:19:55.821	1	KG
b0d59239-7b73-492b-8cf8-d0ddba9b5d2e	230f5c47-5d61-4da1-adfc-6aa5d46f7111	SKU-011-1-5LTR	Weight: 1.5Ltr	80.00	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 12:25:21.533	2026-06-17 12:25:21.533	1	KG
f48488c2-d01c-47a1-98f2-8073d9f103db	1f87d70a-7fb5-43e9-a41c-87b29873a33b	SKU-019-SMALL	Pack: Small	20.00	\N	\N	{"optionValues": {"pack": "Small"}, "optionValueIds": {"pack": "12e6652f-be05-405f-8647-8cc760628251"}}	0	t	2026-06-17 12:43:52.656	2026-06-17 12:43:52.656	1	KG
3ddee9a7-cbf0-4ce6-9f0a-1b71cf16d076	1f87d70a-7fb5-43e9-a41c-87b29873a33b	SKU-019-LONG-BAR	Pack: Long Bar	50.00	\N	\N	{"optionValues": {"pack": "Long Bar"}, "optionValueIds": {"pack": "b7624b89-1245-4380-936f-3ec1cc995001"}}	1	t	2026-06-17 12:43:52.67	2026-06-17 12:44:02.44	1	KG
480fc5fd-9198-4c2f-ae38-8a0b052a9313	09cfaa0d-9088-4e2d-823e-3ad80af8853b	SKU-017-2LTR	Weight: 2Ltr	159.00	\N	\N	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	0	t	2026-06-17 13:05:19.644	2026-06-17 13:05:19.644	1	KG
5d134927-3268-4c92-93d9-681783b1ef2f	703a281b-41db-4a68-9833-1726f52f77ac	sku-024-1PACK	Pack: 1Pack	100.00	\N	\N	{"optionValues": {"pack": "1Pack"}, "optionValueIds": {"pack": "325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7"}}	0	t	2026-08-10 15:46:36.166	2026-08-10 15:46:36.166	1	KG
b414b725-03bb-4a19-90e3-fa9607592a4c	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-14 12:49:48.742	2026-08-14 12:49:48.742	80	G
f8588e5d-9c08-46fd-a898-9aa2f84906c8	92c58ce2-1a3a-41a1-9200-b19472198647	sku-034-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:34:57.346	2026-08-14 13:34:57.346	100	G
d0290fe1-2312-459e-be85-97fba9a5a1a6	0019bc5a-cfda-423a-8033-04e19527878c	SKU-002-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-14 12:49:48.758	2026-08-14 12:50:02.143	160	G
6b83fd33-f2a0-44f6-aefa-6040ddebfe38	93b883de-d033-4336-99bf-d802b93e700f	sku-032-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:00:06.72	2026-08-14 13:00:06.72	100	G
90aaf524-b20d-4ccb-a762-81ed063917e8	92c58ce2-1a3a-41a1-9200-b19472198647	sku-034-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:34:57.378	2026-08-14 13:35:34.348	500	G
698a8acc-c5bd-43a5-89dd-e122bf57834e	93b883de-d033-4336-99bf-d802b93e700f	sku-032-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:00:06.735	2026-08-14 13:00:33.516	200	G
f7256127-9f87-4def-97d6-ef4dfa0aa01a	93b883de-d033-4336-99bf-d802b93e700f	sku-032-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:00:06.743	2026-08-14 13:00:40.013	400	G
a5eda025-6ee1-469a-8937-6280547a3347	93b883de-d033-4336-99bf-d802b93e700f	sku-032-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:00:06.751	2026-08-14 13:00:48.122	500	G
08de828e-48ee-4791-adbd-ffeeaeb98bea	93b883de-d033-4336-99bf-d802b93e700f	sku-032-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:00:06.758	2026-08-14 13:00:54.31	1	KG
33973007-0839-4dd3-8c6f-af8b8ac76ffb	92c58ce2-1a3a-41a1-9200-b19472198647	sku-034-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:34:57.37	2026-08-14 13:35:28.174	400	G
a1ce5c73-d36d-45ff-b59f-426ed7d072bc	92c58ce2-1a3a-41a1-9200-b19472198647	sku-034-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:34:57.386	2026-08-14 13:35:41.279	1	KG
51240564-8eb4-4280-9a16-61eeba638f77	92c58ce2-1a3a-41a1-9200-b19472198647	sku-034-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:34:57.362	2026-08-14 13:35:22.48	200	G
bff4e473-e6be-454e-ab4f-98f7a6fa847d	ff11dcac-4171-4d61-99a3-b2cc9d174de1	sku-008-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-14 13:45:04.211	2026-08-14 13:45:04.211	80	G
3dbb8353-749c-4007-966b-7709efc0806d	ff11dcac-4171-4d61-99a3-b2cc9d174de1	sku-008-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-14 13:45:04.227	2026-08-14 13:45:22.103	160	G
80c8d8b5-ebed-42d3-aca4-9611d4585f71	72c84214-a05b-40e8-9093-d76177afd8d9	SKU-009-1-5LTR	Weight: 1.5Ltr	200.00	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 12:21:22.498	2026-06-17 12:21:22.498	1	KG
b85f7fa3-cb5b-4754-8399-6f792a3bf635	5eaf65df-0faa-4975-be7b-6a2554a04f13	SKU-010-1-5LTR	Weight: 1.5Ltr	80.00	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 12:22:41.869	2026-06-17 12:22:41.869	1	KG
cd8e05c4-96f5-488b-aa34-74083d3e2978	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-ROSE-3LTR	Flavour: Rose • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "Rose"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "30d60dcc-867c-4fbd-a208-4aef88480725"}}	0	t	2026-06-17 12:31:36.385	2026-06-17 12:31:36.385	1	KG
ad533fd1-8637-4268-bf5c-c8dcd1febdc6	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-LEVANDER-3LTR	Flavour: Levander • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "Levander"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "edcb2d16-3ef8-46ed-84c0-b55925836025"}}	1	t	2026-06-17 12:31:36.402	2026-06-17 12:31:36.402	1	KG
34eddf36-827a-4247-9037-4af9dae3a462	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-WHITE-3LTR	Flavour: White • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "White"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "adda47fd-5c46-4ebf-8a6e-133548aba59e"}}	2	t	2026-06-17 12:31:36.41	2026-06-17 12:31:36.41	1	KG
3fcd3a63-0d69-4368-8078-4094c1f0d595	b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013-JASMINE-3LTR	Flavour: Jasmine • Weight: 3Ltr	370.00	\N	\N	{"optionValues": {"weight": "3Ltr", "flavour": "Jasmine"}, "optionValueIds": {"weight": "82b87405-7303-4194-8470-0b74022faa4c", "flavour": "d1f00583-8325-4de2-8d03-13e550682edd"}}	3	t	2026-06-17 12:31:36.418	2026-06-17 12:31:36.418	1	KG
e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	05268a8c-518a-4ff4-8691-3cfdff054382	SKU-021-1PCS	Pack: 1Pcs	50.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:04:05.605	2026-06-17 13:04:05.605	1	KG
4e7ea113-5c3c-4315-96f5-357735682caa	2881ef70-d26b-4da5-af06-9e0c5795fee4	SKU-018-1-5LTR	Weight: 1.5Ltr	79.98	\N	\N	{"optionValues": {"weight": "1.5Ltr"}, "optionValueIds": {"weight": "f56ce2c9-7e87-4eaf-8588-d6c8822a106e"}}	0	t	2026-06-17 13:04:53.64	2026-06-17 13:04:53.64	1	KG
cb0eb246-2ad0-45d8-9be8-07f10fcbf62d	46ee9fc8-c21e-4b8c-9003-7337ea88ab68	SKU-016-2LTR	Weight: 2Ltr	180.00	\N	\N	{"optionValues": {"weight": "2Ltr"}, "optionValueIds": {"weight": "0f01dc86-2798-4ffb-9902-663a759b845e"}}	0	t	2026-06-17 13:05:37.299	2026-06-17 13:05:37.299	1	KG
efbf85a4-a7b1-4ead-83db-4c7df04e3790	07b2bf6a-2585-42f2-a7fd-ecc432b11861	SKU-015-1PCS	Pack: 1Pcs	100.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-17 13:05:50.637	2026-06-17 13:05:50.637	1	KG
48de193f-546c-4de8-b665-15e8cab49584	03e5ef08-6883-4fd0-9583-94a2734aad9a	SKU-014-1BOTTLE	Pack: 1Bottle	100.00	\N	\N	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	0	t	2026-06-17 13:06:45.46	2026-06-17 13:06:45.46	1	KG
120f37f1-42aa-45c0-b801-4731330886e3	df541ce1-98b2-49a0-8479-f5a9e1532a85	SKU-012-1BOTTLE	Pack: 1Bottle	200.00	\N	\N	{"optionValues": {"pack": "1Bottle"}, "optionValueIds": {"pack": "a2203e30-f48b-48d9-8a20-f17b52937ced"}}	0	t	2026-06-17 13:07:10.025	2026-06-17 13:07:10.025	1	KG
fd301154-c132-4757-b8c2-4dbfb0d4da47	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	sku-025-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 12:27:26.535	2026-08-14 12:27:26.535	100	G
c916c054-a802-4e98-8c74-8682c10794f7	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	sku-025-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 12:27:26.56	2026-08-14 12:29:50.253	400	G
21cd4993-8fab-4fe5-8b1f-5a69661eb6e9	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	sku-025-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 12:27:26.552	2026-08-14 12:28:05.386	200	G
01db20e4-da5e-413d-9d59-afd69e903448	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	sku-025-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 12:27:26.576	2026-08-14 12:29:56.697	1	KG
d971ec3a-610e-4320-b6a2-13cced2b87ac	f6fe519e-0c49-4287-b159-38fe55905c25	sku-029-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-14 12:54:40.771	2026-08-14 12:54:40.771	80	G
726c60a2-c0eb-4913-8a36-a867105b693d	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:19:21.302	2026-08-14 13:19:21.302	100	G
d6756dc5-efdd-414e-a06f-08dee6f14af9	a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	sku-025-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 12:27:26.567	2026-08-14 12:29:53.126	500	G
bad2686d-a6bf-41f6-bd64-40825298a3c5	f6fe519e-0c49-4287-b159-38fe55905c25	sku-029-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-14 12:54:40.787	2026-08-14 12:57:18.197	160	G
9a320130-4450-4711-a7a8-52fcb50022cf	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:19:21.324	2026-08-14 13:19:51.215	400	G
f3412483-d994-4600-89c0-6f06d2e40ef8	f22228fb-4106-4dc0-8a63-b4e6093b8c28	sku-020-1PACK	Pack: 1Pack	100.00	\N	\N	{"optionValues": {"pack": "1Pack"}, "optionValueIds": {"pack": "325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7"}}	0	t	2026-08-10 15:43:37.907	2026-08-10 15:43:37.907	1	KG
7dccb3d2-1700-4b01-8ae2-3b27defd96e4	11920e18-2c21-473c-a201-54cfa6870a03	SKU-007-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-09 21:34:06.274	2026-08-14 12:52:49.638	80	G
dab15350-43b5-4b34-b7b5-19109578dfb6	90792798-2b85-4423-8eba-e7f12c64617d	SKU-020-1PCS	Pack: 1Pcs	20.00	\N	\N	{"optionValues": {"pack": "1Pcs"}, "optionValueIds": {"pack": "08b9ab65-eba3-4875-a761-485f6196f74e"}}	0	t	2026-06-19 11:43:27.985	2026-06-19 11:43:27.985	1	KG
4b64825c-8ab1-459d-b165-3c7d24f2ca40	64289463-e48b-4261-bfef-e59b622eb20e	SKU-004-30GRAM	weight: 30gram	30.00	\N	\N	{"optionValues": {"w": "30gram"}, "optionValueIds": {"w": "b1129a0b-6c8e-47f7-aa9d-0a2ca96445c5"}}	0	t	2026-08-09 21:31:06.661	2026-08-09 21:31:06.661	30	G
db9babba-16bb-467b-993a-a82e790c2937	11920e18-2c21-473c-a201-54cfa6870a03	SKU-007-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-09 21:34:06.284	2026-08-09 21:34:36.5	160	G
ea7a85c4-ee49-4236-8415-9ef721211e62	2e6248be-15bb-45a8-8dc1-245118193c6f	SKU-005-80GRAM	weight: 80gram	80.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-09 21:38:12.36	2026-08-09 21:38:12.36	80	G
d7c62cda-b7cf-43c3-806b-e62f07d4db78	2ca10703-c8c7-4688-94e8-ac1c930ad511	sku-009-250GRAM	weight: 250gram	500.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	0	t	2026-08-09 21:43:05.676	2026-08-09 21:43:05.676	250	G
484a9ea0-79ac-4b5e-996c-c4d376c1803e	fb39c7d5-a4c8-43b6-abed-24fa74046d1d	SKU-006-250GRAM	weight: 250gram	240.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	0	t	2026-08-09 21:23:57.475	2026-08-09 21:23:57.475	250	G
5b793fee-7b4c-488b-963a-d2dfcff60d1b	0e953924-85eb-433e-aab8-172352c47c20	sku-021-1PACK	Pack: 1Pack	100.00	\N	\N	{"optionValues": {"pack": "1Pack"}, "optionValueIds": {"pack": "325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7"}}	0	t	2026-08-10 15:44:50.712	2026-08-10 15:44:50.712	1	KG
e777530b-83de-4e6b-8b54-5db5ea6e97a4	42881996-e1e9-48b5-bc90-7879faa68e99	sku-026-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 12:39:49.082	2026-08-14 12:39:49.082	100	G
7f217385-809c-43e1-963d-b4ba213ff7ea	42881996-e1e9-48b5-bc90-7879faa68e99	sku-026-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 12:39:49.114	2026-08-14 12:44:04.992	500	G
02479d88-36af-4f24-bcc5-3961eabd5b44	ad76bca0-acfc-45a6-91c7-1ef7099e9275	sku-027-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 12:43:02.244	2026-08-14 12:43:02.244	100	G
97e0bb0b-e90b-417d-9cc7-b1b2230b18cf	9888d0bb-b6d8-47b7-8132-28dd4147cb43	sku-035-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:37:21.664	2026-08-14 13:37:21.664	100	G
86fe4a20-100b-4f78-a8d0-c6d47553ce93	42881996-e1e9-48b5-bc90-7879faa68e99	sku-026-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 12:39:49.121	2026-08-14 12:44:09.596	1	KG
28825a16-ce19-45ca-be5a-c61e7d62b418	c7d28472-8483-416b-908b-39bbd023e33e	sku-030-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-14 12:56:52.478	2026-08-14 12:56:52.478	80	G
d72ede7d-51a0-4b8a-897e-de58e6ae1516	ad76bca0-acfc-45a6-91c7-1ef7099e9275	sku-027-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 12:43:02.254	2026-08-14 12:43:35.697	200	G
3a9d2b1a-8683-4305-8e74-9b8ef9975ecf	ad76bca0-acfc-45a6-91c7-1ef7099e9275	sku-027-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 12:43:02.261	2026-08-14 12:43:38.906	400	G
186b320e-1ce1-4242-9fe0-a2382c9a3cff	ad76bca0-acfc-45a6-91c7-1ef7099e9275	sku-027-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 12:43:02.268	2026-08-14 12:43:41.675	500	G
fc990784-5496-43ed-91d2-20dc6d04b4c8	ad76bca0-acfc-45a6-91c7-1ef7099e9275	sku-027-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 12:43:02.275	2026-08-14 12:43:45.381	1	KG
c354d84c-c71d-403e-a2b9-312bd9d226b8	42881996-e1e9-48b5-bc90-7879faa68e99	sku-026-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 12:39:49.098	2026-08-14 12:43:59.282	200	G
bef9d1f2-0bff-48ac-b287-28cde0bf9d10	42881996-e1e9-48b5-bc90-7879faa68e99	sku-026-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 12:39:49.106	2026-08-14 12:44:01.932	400	G
fc07ff65-d84c-4b53-9599-a4d3d797d367	c7d28472-8483-416b-908b-39bbd023e33e	sku-030-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-14 12:56:52.492	2026-08-14 12:57:04.577	160	G
2d89e90f-94d1-4532-a36f-9d2171e9dfd7	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:19:21.332	2026-08-14 13:19:56.584	500	G
19ccc911-047d-444b-86d0-3ba6ec03334f	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:19:21.317	2026-08-14 13:19:45.835	200	G
821bb87e-92d3-4ed7-98ad-0ad328271b2c	c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:19:21.34	2026-08-14 13:20:05.002	1	KG
8f287418-9523-43fd-9074-ac6381aff7d0	9888d0bb-b6d8-47b7-8132-28dd4147cb43	sku-035-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:37:21.694	2026-08-14 13:37:58.834	500	G
9e606a21-af89-4d73-b9bf-4472ff252b36	9888d0bb-b6d8-47b7-8132-28dd4147cb43	sku-035-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:37:21.701	2026-08-14 13:38:05.268	1	KG
39b4f942-20a1-4c7f-afa3-5d294305faf0	9888d0bb-b6d8-47b7-8132-28dd4147cb43	sku-035-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:37:21.686	2026-08-14 13:37:51.086	400	G
d8ac9ee5-3071-471f-ba8f-c7562e6e20f1	67adc18a-0b78-4b7e-9d85-791c11360d96	sku-022-1PACK	Pack: 1Pack	100.00	\N	\N	{"optionValues": {"pack": "1Pack"}, "optionValueIds": {"pack": "325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7"}}	0	t	2026-08-10 15:45:42.63	2026-08-10 15:45:42.63	1	KG
8a8ab41b-1143-41d7-8dbf-3d6317a6eaac	48d973ce-0795-4e24-9adb-d897c7d8d8a9	sku-023-1PACK	Pack: 1Pack	100.00	\N	\N	{"optionValues": {"pack": "1Pack"}, "optionValueIds": {"pack": "325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7"}}	0	t	2026-08-10 15:47:20.732	2026-08-10 15:47:20.732	1	KG
bd42445d-9f3c-40f4-9cdf-a6f2e19947b5	d9c95ec4-df7a-4778-86bb-c3818e8cac28	sku-028-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 12:46:50.022	2026-08-14 12:46:50.022	100	G
818bb94d-4faf-4af2-8e48-ccf3bb712d4c	d9c95ec4-df7a-4778-86bb-c3818e8cac28	sku-028-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 12:46:50.057	2026-08-14 12:47:32.27	1	KG
2b4f665e-d2cd-4633-8e6f-e78ef1a17ca8	09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	sku-031-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-14 12:58:38.828	2026-08-14 12:58:38.828	80	G
3304f70d-4296-4e6e-8af3-2296b477bb76	d9c95ec4-df7a-4778-86bb-c3818e8cac28	sku-028-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 12:46:50.036	2026-08-14 12:47:13.366	200	G
df6ef30f-11b7-4d9d-a11f-7dde056894ab	d9c95ec4-df7a-4778-86bb-c3818e8cac28	sku-028-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 12:46:50.042	2026-08-14 12:47:19.451	400	G
9ba01678-18ec-43d8-aa86-1324fe5ae531	d9c95ec4-df7a-4778-86bb-c3818e8cac28	sku-028-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 12:46:50.051	2026-08-14 12:47:26.191	500	G
cba4cb74-7292-4609-8c4d-1af78cbd7cbd	09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	sku-031-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-14 12:58:38.844	2026-08-14 12:58:51.663	160	G
08f139df-d8b4-4ee7-9e93-61317b186a00	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	sku-033-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:32:53.398	2026-08-14 13:32:53.398	100	G
f36e0fb5-3f6e-40a9-93bd-4ea16eb3b7d1	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	sku-033-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:32:53.418	2026-08-14 13:33:24.142	400	G
92735483-f886-44e0-8741-c482c64190a6	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	sku-033-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:32:53.423	2026-08-14 13:33:32.149	500	G
99e65965-36d9-4942-905d-0bb4f1ff44a4	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	sku-033-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:32:53.43	2026-08-14 13:33:38.287	1	KG
70f3a35c-1a0f-4cfa-9c33-8810c2a04913	5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	sku-033-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:32:53.412	2026-08-14 13:33:17.094	200	G
4c3c762a-ef77-48cf-95d8-ca9781e23939	9888d0bb-b6d8-47b7-8132-28dd4147cb43	sku-035-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:37:21.679	2026-08-14 13:37:45.692	200	G
077cabf2-9484-4b1f-8ba8-d2960bc6e20f	2f9be750-3d78-4030-8721-beca75a69b46	sku-36-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:48:34.418	2026-08-14 13:48:34.418	100	G
4cfa35e8-6818-427d-b431-2801720af628	3edc41b7-3996-4d29-8ece-a8282dd70fda	sku-038-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 14:02:56.244	2026-08-14 14:03:32.062	400	G
f3ad0845-7231-4cad-8081-e6a4ebfcfaa4	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	sku-037-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:56:17.524	2026-08-14 13:57:12.578	500	G
26db009d-b92e-4cc0-8240-241abff4f821	3edc41b7-3996-4d29-8ece-a8282dd70fda	sku-038-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 14:02:56.253	2026-08-14 14:03:35.803	500	G
1a42be08-74ff-45a1-b314-9e8a55dfb574	2f9be750-3d78-4030-8721-beca75a69b46	sku-36-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:48:34.428	2026-08-14 13:49:08.227	200	G
150978ca-a27a-4fe9-ad9c-a7c78fc625b9	2f9be750-3d78-4030-8721-beca75a69b46	sku-36-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:48:34.435	2026-08-14 13:51:28.154	400	G
c85a4b4a-5f36-4754-b5d2-6165b5bdf977	2f9be750-3d78-4030-8721-beca75a69b46	sku-36-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-14 13:48:34.443	2026-08-14 13:53:38.899	500	G
17f49cb8-5877-43cb-aae8-ff336636ee44	2f9be750-3d78-4030-8721-beca75a69b46	sku-36-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:48:34.451	2026-08-14 13:53:44.987	1	KG
3fe5a35e-51a0-4a3f-ace9-d47273a5086c	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	sku-037-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 13:56:17.491	2026-08-14 13:56:17.491	100	G
014ae71e-970a-4a6f-aa77-d16bcf7ff5cc	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	sku-037-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 13:56:17.532	2026-08-14 13:57:16.124	1	KG
2edfd8cf-1fc1-420d-956a-4641349eebc3	3edc41b7-3996-4d29-8ece-a8282dd70fda	sku-038-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-14 14:02:56.223	2026-08-14 14:02:56.223	100	G
3fd2dd57-5c35-455b-9c00-b8a766c99af8	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	sku-037-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 13:56:17.507	2026-08-14 13:56:43.562	200	G
f9afe415-357b-4495-9edd-18cd2b566964	185d2b70-8297-41cf-afc5-ee14fd38464a	sku-040-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-15 20:06:44.269	2026-08-15 20:06:44.269	100	G
db89aec9-bb55-4000-872f-4214f59b138d	3edc41b7-3996-4d29-8ece-a8282dd70fda	sku-038-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-14 14:02:56.261	2026-08-14 14:03:40.591	1	KG
2fcecb5b-c280-4348-87bd-d644b4e671d4	2c7e550f-32a1-465e-b974-f57f152838fb	sku-039-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-15 20:05:08.2	2026-08-15 20:05:08.2	100	G
8d2ae540-cc15-49e3-b014-58c260c9002d	c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	sku-037-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-14 13:56:17.516	2026-08-14 13:57:06.782	400	G
b375a668-b488-4aa7-9ea1-d8fe0fd2db2d	3edc41b7-3996-4d29-8ece-a8282dd70fda	sku-038-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-14 14:02:56.236	2026-08-14 14:03:27.932	200	G
1b58621b-3d2a-4e9d-ae99-d7d51f2d7d2e	2c7e550f-32a1-465e-b974-f57f152838fb	sku-039-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-15 20:05:08.215	2026-08-15 20:05:31.746	200	G
ab8c8299-d521-4f51-b6a8-1a54272aa64f	2c7e550f-32a1-465e-b974-f57f152838fb	sku-039-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-15 20:05:08.222	2026-08-15 20:05:36.663	300	G
1acc5109-eb3a-4edb-a7d4-ab5c0acee9a8	2c7e550f-32a1-465e-b974-f57f152838fb	sku-039-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-15 20:05:08.231	2026-08-15 20:05:42.917	400	G
5727189c-7cc0-4ddf-a4a2-db701d7b246b	2c7e550f-32a1-465e-b974-f57f152838fb	sku-039-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-15 20:05:08.239	2026-08-15 20:05:47.947	1	KG
32db76b1-c4d2-4c23-a520-a54607b6e741	185d2b70-8297-41cf-afc5-ee14fd38464a	sku-040-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-15 20:06:44.295	2026-08-15 20:07:17.735	400	G
1822b85a-61a6-4942-bcb3-1295d7bc8cea	185d2b70-8297-41cf-afc5-ee14fd38464a	sku-040-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-15 20:06:44.302	2026-08-15 20:07:23.518	500	G
f4a8ef89-5c3d-4146-9b16-f3fd41fa2442	185d2b70-8297-41cf-afc5-ee14fd38464a	sku-040-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-15 20:06:44.31	2026-08-15 20:07:29.466	1	KG
665e39cf-cb52-465c-afa4-f628fc6d3615	185d2b70-8297-41cf-afc5-ee14fd38464a	sku-040-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-15 20:06:44.285	2026-08-15 20:07:12.443	200	G
a1ad008c-9ad0-4db3-9932-bc48e58ecdb8	93d74064-c8a2-47bf-8eee-1065890b9787	sku-041-180GRAM	weight: 180gram	220.00	\N	\N	{"optionValues": {"w": "180gram"}, "optionValueIds": {"w": "047e43eb-fee5-43fe-a196-a0693d6b5464"}}	0	t	2026-08-15 20:09:08.835	2026-08-15 20:09:08.835	180	G
71355584-5775-4be1-806a-f3c9575f9e31	eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003-180GRAM	weight: 180gram	220.00	\N	\N	{"optionValues": {"w": "180gram"}, "optionValueIds": {"w": "047e43eb-fee5-43fe-a196-a0693d6b5464"}}	0	t	2026-08-15 20:10:07.944	2026-08-15 20:10:07.944	180	G
e00ecc16-14e6-448e-b745-bf555ffe3d3f	cafb9e6a-4403-4838-8235-1f2b976df6a8	sku-042-180GRAM	weight: 180gram	220.00	\N	\N	{"optionValues": {"w": "180gram"}, "optionValueIds": {"w": "047e43eb-fee5-43fe-a196-a0693d6b5464"}}	0	t	2026-08-15 20:11:28.737	2026-08-15 20:11:28.737	180	G
2be2da7e-c395-4ea3-8ea9-2abcc7f79b58	bed71484-1d2a-48b7-8947-2bba63063442	sku-043-80GRAM	weight: 80gram	100.00	\N	\N	{"optionValues": {"w": "80gram"}, "optionValueIds": {"w": "3a83fd97-e566-44d0-9d6d-ab568bae9f69"}}	0	t	2026-08-15 20:15:24.757	2026-08-15 20:15:24.757	80	G
1cdea472-3122-4629-88b2-59a8415d0e92	65777ded-ce30-4523-8c74-38c8f3c90e21	sku-018-250GRAM	weight: 250gram	400.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:23:55.699	2026-08-19 07:24:24.74	250	G
6811c0c2-1a06-4eb9-8e28-dabb18a431cc	bed71484-1d2a-48b7-8947-2bba63063442	sku-043-160GRAM	weight: 160gram	200.00	\N	\N	{"optionValues": {"w": "160gram"}, "optionValueIds": {"w": "20f4ffb2-f54d-49c6-83b9-0379a446e08d"}}	1	t	2026-08-15 20:15:24.773	2026-08-15 20:15:36.451	160	G
3a50b8f0-ecb7-4ef4-a8c5-c648c55b5b6e	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	sku-044-100GRAM	weight: 100gram	110.00	\N	\N	{"optionValues": {"w": "100gram"}, "optionValueIds": {"w": "6675f571-9c67-4158-86a4-a80afbeea01a"}}	0	t	2026-08-15 20:16:33.951	2026-08-15 20:16:33.951	100	G
87555558-4a6c-44c3-ba89-106bb3760e08	80f348a7-d613-4955-87c8-13b23f6034c6	sku-019-HALF-KG	weight: half kg	700.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:20:53.516	2026-08-19 07:21:39.583	500	G
3fc3b9ae-162d-4666-9e1d-62ca4b683ce1	80f348a7-d613-4955-87c8-13b23f6034c6	sku-019-250GRAM	weight: 250gram	350.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:20:53.538	2026-08-19 07:22:18.496	250	G
85666d70-c39f-4337-ac51-60d5f4488c1e	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	sku-044-200GRAM	weight: 200gram	220.00	\N	\N	{"optionValues": {"w": "200gram"}, "optionValueIds": {"w": "45f08eac-42f5-4f20-9b64-e229f75c4df4"}}	1	t	2026-08-15 20:16:33.966	2026-08-15 20:17:00.813	200	G
d3dd1a88-1715-4840-bef4-d5bc7bd90825	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	sku-044-400GRAM	weight: 400gram	440.00	\N	\N	{"optionValues": {"w": "400gram"}, "optionValueIds": {"w": "2583ce01-e9d6-41c6-997d-03085c3a6b92"}}	2	t	2026-08-15 20:16:33.974	2026-08-15 20:17:07.415	400	G
44ed96d0-8f82-4911-9a93-ab8eb6494607	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	sku-044-500GRAM	weight: 500gram	550.00	\N	\N	{"optionValues": {"w": "500gram"}, "optionValueIds": {"w": "83a2dbc1-7521-4ccc-973d-8662901ba911"}}	3	t	2026-08-15 20:16:33.982	2026-08-15 20:17:11.96	500	G
07556f02-fb3e-4da1-86e9-c56d68907342	a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	sku-044-1KG	weight: 1kg	1100.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	4	t	2026-08-15 20:16:33.99	2026-08-15 20:17:16.926	1	KG
59068913-f30c-47de-b871-39a7a999be2e	80f348a7-d613-4955-87c8-13b23f6034c6	sku-019-1KG	weight: 1kg	1400.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:20:53.545	2026-08-19 07:20:53.545	1	KG
57d63dcd-b5ff-4670-9ba5-f25dbc7c2143	d26afe56-30c5-4778-ad65-8d7fff9782f5	sku-017-1KG	weight: 1kg	1200.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:25:18.717	2026-08-19 07:25:18.717	1	KG
f7c1809a-924d-4752-83b3-278ddfe0a86e	65777ded-ce30-4523-8c74-38c8f3c90e21	sku-018-1KG	weight: 1kg	1600.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:23:55.707	2026-08-19 07:23:55.707	1	KG
84fb9d05-ccba-4e7b-9768-babc21a071a0	d26afe56-30c5-4778-ad65-8d7fff9782f5	sku-017-250GRAM	weight: 250gram	300.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:25:18.71	2026-08-19 07:25:41.736	250	G
5c8de76c-f0f9-4651-a4e0-aacb4cdcbc3c	8424893c-142f-4bbd-ad5f-72423b437023	sku-016-1KG	weight: 1kg	880.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:26:44.412	2026-08-19 07:26:44.412	1	KG
0ab2a210-3672-4ec1-83c7-d62d89660171	65777ded-ce30-4523-8c74-38c8f3c90e21	sku-018-HALF-KG	weight: half kg	800.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:23:55.689	2026-08-19 07:24:17.903	500	G
f5688887-d66e-4e88-ae6f-68c9fca398fb	1b043109-6718-4011-b376-ac801a7aa13a	sku-015-1KG	weight: 1kg	1200.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:27:53.263	2026-08-19 07:27:53.263	1	KG
35a641be-437b-4adb-b950-4253633982ff	1b043109-6718-4011-b376-ac801a7aa13a	sku-015-HALF-KG	weight: half kg	600.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:27:53.24	2026-08-19 07:28:15.857	500	G
1cd4a1fd-7be4-4536-a9f8-fb5262991f0b	d26afe56-30c5-4778-ad65-8d7fff9782f5	sku-017-HALF-KG	weight: half kg	600.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:25:18.695	2026-08-19 07:25:35.189	500	G
1fb09500-0aea-45cd-98c8-027a6b3e5081	8424893c-142f-4bbd-ad5f-72423b437023	sku-016-250GRAM	weight: 250gram	220.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:26:44.402	2026-08-19 07:27:11.963	250	G
03314898-7431-4813-963b-c114c9a5a7b1	8424893c-142f-4bbd-ad5f-72423b437023	sku-016-HALF-KG	weight: half kg	440.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:26:44.385	2026-08-19 07:27:10.019	500	G
5d316832-1b46-4461-916a-334c84d31170	1b043109-6718-4011-b376-ac801a7aa13a	sku-015-250GRAM	weight: 250gram	300.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:27:53.256	2026-08-19 07:28:20.439	250	G
0724246d-0578-4106-837f-ed0d60a79e46	426328ce-253f-4477-b6ad-0842c4f8da51	sku-014-1KG	weight: 1kg	1300.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:28:53.341	2026-08-19 07:28:53.341	1	KG
a2f2e676-56a8-4415-8834-a7c8824b6a13	426328ce-253f-4477-b6ad-0842c4f8da51	sku-014-250GRAM	weight: 250gram	325.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:28:53.332	2026-08-19 07:29:35.392	250	G
1a40c60b-25e5-4daf-a894-6c5ff37c21ae	426328ce-253f-4477-b6ad-0842c4f8da51	sku-014-HALF-KG	weight: half kg	650.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:28:53.318	2026-08-19 07:29:18.184	500	G
59e51fb0-c229-42c1-827e-4e36005ff97b	aa5a044f-6947-42ac-88d2-19535c17ea2c	sku-013-1KG	weight: 1kg	1200.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:30:30.992	2026-08-19 07:30:30.992	1	KG
c7cf9c18-b833-4f4c-b8b7-4a307b71fc3a	3bb1a00d-202e-4c8d-8164-dce9b289a60d	sku-011-HALF-KG	weight: half kg	600.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:32:31.083	2026-08-19 07:32:53.927	500	G
4176054d-5f79-4916-8ae3-6ea1c4ceecfe	aa5a044f-6947-42ac-88d2-19535c17ea2c	sku-013-HALF-KG	weight: half kg	600.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:30:30.969	2026-08-19 07:30:45.878	500	KG
26d5e0a6-ff90-4b3f-af55-7eb02c45cc97	aa5a044f-6947-42ac-88d2-19535c17ea2c	sku-013-250GRAM	weight: 250gram	300.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:30:30.984	2026-08-19 07:30:55.155	250	KG
cf7b7300-fe24-405f-9349-ab0c0e57e28d	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	sku-012-1KG	weight: 1kg	1000.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:31:33.995	2026-08-19 07:31:33.995	1	KG
08c6f0a0-45c4-478e-b8b3-73a6bfd2425c	3bb1a00d-202e-4c8d-8164-dce9b289a60d	sku-011-250GRAM	weight: 250gram	300.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:32:31.094	2026-08-19 07:33:10.029	250	G
b7e6e695-bc83-4b05-9939-35b01370313f	cada9aad-ebd1-4931-85db-1b5b6d43638a	sku-010-1KG	weight: 1kg	1360.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:33:49.207	2026-08-19 07:33:49.207	1	KG
b0bac037-5a47-4b73-a76e-cd3290a4c139	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	sku-012-HALF-KG	weight: half kg	500.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:31:33.973	2026-08-19 07:31:55.711	500	G
bc2cbe51-541e-4bd6-a6dc-18ad784d0da2	ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	sku-012-250GRAM	weight: 250gram	250.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:31:33.988	2026-08-19 07:32:01.315	250	G
ab01460a-742c-4df1-88a2-d10338e88c7f	3bb1a00d-202e-4c8d-8164-dce9b289a60d	sku-011-1KG	weight: 1kg	1200.00	\N	\N	{"optionValues": {"w": "1kg"}, "optionValueIds": {"w": "91979004-6cae-4a76-9ff5-9444026de0f6"}}	2	t	2026-08-19 07:32:31.103	2026-08-19 07:32:31.103	1	KG
7fbcd890-2de8-48c9-a6fd-0baec249480b	cada9aad-ebd1-4931-85db-1b5b6d43638a	sku-010-HALF-KG	weight: half kg	680.00	\N	\N	{"optionValues": {"w": "half kg"}, "optionValueIds": {"w": "40031c52-0288-4c97-8fcc-1670b5ad4dbd"}}	0	t	2026-08-19 07:33:49.182	2026-08-19 07:34:12.385	500	KG
30cb08f1-d606-4f57-a942-98d856b30eb4	cada9aad-ebd1-4931-85db-1b5b6d43638a	sku-010-250GRAM	weight: 250gram	340.00	\N	\N	{"optionValues": {"w": "250gram"}, "optionValueIds": {"w": "500b45bd-6add-4bb4-80dc-d88f8ee46cc7"}}	1	t	2026-08-19 07:33:49.197	2026-08-19 07:34:16.845	250	KG
\.


--
-- TOC entry 5671 (class 0 OID 21456)
-- Dependencies: 249
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, slug, type, description, short_description, base_price, cost, weight, status, visibility, tax_class_id, attributes, meta_data, created_at, updated_at, deleted_at, shipping_weight, shipping_weight_unit) FROM stdin;
eb72e342-64df-4566-8029-db2c63859130	SKU-008	Perfume Phenyl	perfume-phenyl	configurable	"Scent Your Sanctuary: Unlock Your Bathroom’s True Fragrance"\nTransform your home environment with the premium Perfume Phenyl Collection by M. Essa Chemicals. Specially crafted to target tough bathroom odors, dampness, and surface grime, this advanced multi-surface formula goes beyond standard cleaning to deeply sanitize your floors while infusing the air with an exquisite, long-lasting luxury fragrance. Perfect for marble, ceramic tiles, and washroom surfaces, it gives you a pristine clean you can see and a refreshing aroma you can instantly feel.	\N	120.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:17:15.615	2026-07-23 07:41:45.408	2026-07-23 07:41:45.407	1	KG
0019bc5a-cfda-423a-8033-04e19527878c	SKU-002	Black Pepper Finger Chips	test-product-1	configurable	Crispy, light, and full of flavor.\nSM Nimco & Sweets Finger Chips are the perfect crunchy snack for every mood, seasoned just right to keep you reaching for more.	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:39.284	2026-08-14 12:49:39.887	\N	80	G
72c84214-a05b-40e8-9093-d76177afd8d9	SKU-009	Toilet Bowl Cleaner	toilet-bowl-cleaner	configurable	"Thick Power Gel: Kills Germs, Removes Rust, No Unpleasant Smell"\nKeep your bathroom spotless and thoroughly sanitized with M. Essa Chemicals Toilet Bowl Cleaner. Engineered with an advanced Thick Power Gel formula, it clings strongly to vertical porcelain surfaces to break down stubborn scale and stains without scrubbing. Unlike harsh alternatives, it sanitizes completely while eliminating bad odors, leaving behind a completely fresh, clean atmosphere.	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:21:11.493	2026-07-23 07:41:47.841	2026-07-23 07:41:47.839	1	KG
07b2bf6a-2585-42f2-a7fd-ecc432b11861	SKU-015	Warrior Cockroach Killer Gel	cockroach-killer	configurable	One Consumes, All Eliminate — Fast and Guaranteed Eradication!"\nThe ultimate defense against cockroaches! An advanced domino-effect formula engineered for rapid elimination and complete eradication of pests from their nests.\nAre you tired of persistent cockroach infestations disrupting your kitchen and home? M. Essa Chemicals introduces Warrior Cockroach Killer Gel, your premium line of defense against stubborn pests. This high-efficacy gel contains an advanced attractant formula that draws cockroaches out from their deepest hiding spots. Once a single cockroach consumes the gel, it carries the active ingredient back to the nest, destroying the entire colony through a powerful chain reaction.	\N	250.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:34:49.065	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
ad76bca0-acfc-45a6-91c7-1ef7099e9275	sku-027	Gathiya	gathiya	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:41:55.254	2026-08-14 12:42:50.687	\N	100	G
92c58ce2-1a3a-41a1-9200-b19472198647	sku-034	Lakri Gathiya	lakri-gathiya	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 13:34:41.394	2026-08-14 13:34:41.394	\N	100	G
d9c95ec4-df7a-4778-86bb-c3818e8cac28	sku-028	Bareek Sev	bareek-sev	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:45:16.202	2026-08-14 12:46:32.086	\N	100	G
8424893c-142f-4bbd-ad5f-72423b437023	sku-016	Balu Shahi	balu-shahi	configurable	\N	\N	880.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:34:12.779	2026-08-15 22:11:06.515	\N	1	KG
fb39c7d5-a4c8-43b6-abed-24fa74046d1d	SKU-006	Sweet Chewra	test-product-5	configurable	Our Sweet Chewra is loaded with nuts, spices, and a delightful sweetness that makes every bite unforgettable!	\N	240.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:12:32.073	2026-08-14 12:19:38.826	\N	250	G
42881996-e1e9-48b5-bc90-7879faa68e99	sku-026	Papri Gathiya	papri-gathiya	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:39:26	2026-08-14 12:39:26	\N	100	G
93b883de-d033-4336-99bf-d802b93e700f	sku-032	Bhel Puri	bhel-puri	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:59:50.146	2026-08-14 12:59:50.146	\N	100	G
c7b8e71d-3489-4bd7-8f88-2e541ee86e41	SKU-001	Dal Moong	test-product	configurable	Crunch into the perfect blend of taste and tradition with SM Nimco & Sweets Daal Mong \nLight, crispy, and packed with flavor, this classic snack is made for every tea time, every gathering, and every craving. One handful is never enough!	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:27.174	2026-08-14 13:18:54.121	\N	100	G
f6fe519e-0c49-4287-b159-38fe55905c25	sku-029	Hyderabadi Chips	hyderabadi-chips	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:54:26.106	2026-08-14 12:54:26.106	\N	80	G
c7d28472-8483-416b-908b-39bbd023e33e	sku-030	Masala Chips	masala-chips	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:56:27.621	2026-08-14 12:56:27.621	\N	80	G
09f88abf-83b1-4329-b17a-4b9dbbeaf8bd	sku-031	Spicy Crinkle Chips	spicy-crinkle-chips	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:58:20.031	2026-08-14 12:58:20.031	\N	80	G
5cbe6a37-b5a4-46df-9a5f-b6b08dc41154	sku-033	Bareek Bondi	bareek-bondi	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 13:32:41.382	2026-08-14 13:32:41.382	\N	100	G
9888d0bb-b6d8-47b7-8132-28dd4147cb43	sku-035	Dal Chana	dal-chana	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 13:37:07.244	2026-08-14 13:37:07.244	\N	100	G
2ca10703-c8c7-4688-94e8-ac1c930ad511	sku-009	Chewra	chewra	configurable	\N	\N	500.00	\N	\N	active	both	\N	{}	{}	2026-08-09 21:42:46.859	2026-08-14 13:41:14.104	\N	250	G
c4d741ce-d0f3-4b0f-98fc-3b06cb829c29	sku-037	Shakar Pare	shakar-pare	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 13:55:35.308	2026-08-14 13:55:35.308	\N	100	G
aa5a044f-6947-42ac-88d2-19535c17ea2c	sku-013	Khopra Pak	khopra-pak	configurable	\N	\N	1200.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:29:52.695	2026-08-15 21:51:40.909	\N	1	KG
d26afe56-30c5-4778-ad65-8d7fff9782f5	sku-017	Malai Khaja	malai-khaja	configurable	\N	\N	1200.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:35:54.3	2026-08-15 21:54:06.576	\N	1	KG
80f348a7-d613-4955-87c8-13b23f6034c6	sku-019	Egg Mesoo	egg-mesaur	configurable	\N	\N	1400.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:38:34.386	2026-08-15 21:56:07.852	\N	1	KG
65777ded-ce30-4523-8c74-38c8f3c90e21	sku-018	Kalakand	kalakand	configurable	\N	\N	1600.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:37:13.022	2026-08-15 21:55:48.133	\N	1	KG
f22228fb-4106-4dc0-8a63-b4e6093b8c28	sku-020	Candy Rusk	candy-rusk	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:43:15.486	2026-08-15 21:56:27.57	\N	1	KG
48d973ce-0795-4e24-9adb-d897c7d8d8a9	sku-023	Peanut Rusk	peanut-rusk	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:47:08.951	2026-08-15 22:15:49.899	\N	1	KG
703a281b-41db-4a68-9833-1726f52f77ac	sku-024	Slice Rusk	slice-rusk	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:46:27.078	2026-08-15 22:16:04.722	\N	1	KG
0e953924-85eb-433e-aab8-172352c47c20	sku-021	Burger Rusk	burger-rusk	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:44:14.462	2026-08-15 22:16:45.353	\N	1	KG
67adc18a-0b78-4b7e-9d85-791c11360d96	sku-022	Gol Rusk	gol-rusk	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:45:19.591	2026-08-15 22:16:31.341	\N	1	KG
2e6248be-15bb-45a8-8dc1-245118193c6f	SKU-005	Chat Papri	test-product-4	configurable	Our crispy, flavorful Coin Papri is the perfect snack for every mood, tea time, movie nights, or anytime cravings hit!	\N	80.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:08:05.816	2026-08-15 20:13:02.399	\N	80	G
230f5c47-5d61-4da1-adfc-6aa5d46f7111	SKU-011	Bleach Strong	bleach-cleaner	configurable	"Bleach Strong: Your Ultimate Clean. 99.9% Germ-Free & Powerful Stain Removal."\nYour ultimate clean! Kills 99.9% of germs and provides powerful stain removal for immaculate whites and pristine, disinfected surfaces.Whether it's restoring the brilliant shine of your white fabrics or maintaining a perfectly disinfected home, M. Essa Chemicals Bleach Strong delivers industrial-grade performance. This advanced formulation targets and breaks down the toughest organic stains, bringing back original fabric brightness while remaining completely fabric-safe.	\N	80.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:23:50.124	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
11920e18-2c21-473c-a201-54cfa6870a03	SKU-007	Crinkle Chips Ketchup	chips	configurable	Our Crincal Salty Chips are perfectly crisp, lightly salted, and made to satisfy your snack cravings anytime.	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:15:17.43	2026-08-14 12:52:36.914	\N	80	G
eaacdf54-eaa9-4dcc-839e-a10a61588523	SKU-003	Salted Peanuts	test-product-2	configurable	Simple, classic, and full of flavor.\nSM Nimco & Sweets Salty Peanuts are perfectly roasted and lightly salted for that timeless crunch you can enjoy anytime.	\N	220.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:49:51.979	2026-08-15 20:09:44.81	\N	180	G
09cfaa0d-9088-4e2d-823e-3ad80af8853b	SKU-017	Sweep-o Floor & Tile Cleaner	sweep-o-floor-tile-cleaner	configurable	"Powerful Formula, Redefined Clean — From Floor to Drain: Your Complete Solution"\nSimplify your home maintenance with Clean 360 Sweep-O by M. Essa Chemicals. This advanced, heavy-duty liquid agent functions as an all-in-one tile and floor cleaner, toilet sanitizer, and powerful drain opener. It dissolves tough organic blockages in your pipes while cutting through thick grout stains and floor grime, delivering deep disinfection and a sparkling finish wherever it is applied.	\N	160.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:37:49.797	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
5eaf65df-0faa-4975-be7b-6a2554a04f13	SKU-010	Tile Wash	tile-wash	configurable	"Strong Tile Wash Power! Antibacterial, Removes Stains, Deep Disinfect Action"\nRestore the pristine, sparkling look of your floors and walls with M. Essa Chemicals Tile Wash. This heavy-duty, high-performance cleaning solution targets deeply embedded dirt, grease, and discoloration on tiled surfaces. Perfect for bathrooms, kitchens, and living areas, its defensive antibacterial formula purifies surfaces to keep your home healthy, germ-free, and immaculately bright.	\N	80.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:22:31.314	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
1f87d70a-7fb5-43e9-a41c-87b29873a33b	SKU-019	Super Sony Dish Wash Soap	super-sony	configurable	"Redefining Kitchen Hygiene: The Super Sony Stronghold"\nBring unmatched grease-cutting power to your kitchen with the Super Sony Lemon Dishwash Bar. Formulated by M. Essa Chemicals, this highly effective dishwashing bar cuts through stubborn oil, baked-on grease, and tough food residues instantly, ensuring your plates and cookware shine brighter. Packed with natural citrus properties, it thoroughly sanitizes your dishes while remaining completely gentle on your hands.	\N	20.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:42:28.802	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
90792798-2b85-4423-8eba-e7f12c64617d	SKU-020	777 Sony Dish Wash Soap	777-sony-dish-wash-soap	configurable	"Tough on Grease, Gentle on Hands — Unrivaled Kitchen Cleaning Power"\nMaster your kitchen cleanup with 777 Sony Dish Wash Soap by M. Essa Chemicals. Engineered with an ultra-concentrated grease-cutting formulation, this premium dishwashing bar slices through dried-on food particles, heavy cooking oils, and stubborn burnt marks instantly. It sheets water away cleanly to prevent unsightly water spots on your premium cutlery.	\N	20.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:44:43.939	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
b4366645-b14a-4de1-b621-e8776dc4f689	SKU-013	Panda Perfume Phenyl	panda-perfume-phenyl	configurable	"Sparkling Deep Cleaning Power — Ultimate Antibacterial Surface Protection"\nProtect your home and restore absolute clarity to your living space with Panda Perfume Phenyl by M. Essa Chemicals. This advanced cross-functional disinfectant floor wash cuts through thick grease tracks, dirt films, and sticky residues while wiping away hidden pathogens on contact. Ideal for marble, tile, and stone surfaces, it leaves behind a streak-free gloss and an amazing premium scent.	\N	370.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:30:01.373	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
df541ce1-98b2-49a0-8479-f5a9e1532a85	SKU-012	Glass Cleaner (Clean 360)	glass-cleaner-clean-360	configurable	"Redefining Cleanliness: Unmatched Clarity. Streaks Gone."\nRestore complete visibility and crystalline reflection to your home with Clean 360 Glass Cleaner by M. Essa Chemicals. Engineered to act rapidly on hard-to-clean glass frames, it effortlessly dissolves stubborn grease films, fingerprints, smudge paths, and water drops. Its specialized anti-fogging shield guarantees a long-lasting clarity that elevates regular maintenance windows with minimal manual wiping.	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:27:56.663	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
2881ef70-d26b-4da5-af06-9e0c5795fee4	SKU-018	Dish Wash Liquid	dish-wash-liquid	configurable	"Redefining Kitchen Hygiene: Unmatched Grease Power. Gentle On Skin."\nUpgrade your daily kitchen sanitation with the M. Essa Dish Wash Liquid Collection. Formulated to streamline washing routines, this highly concentrated fluid attacks thick fat deposits, oily cooking glazes, and dried residues immediately upon contact. Its quick-rinsing chemical structure prevents soapy residues from binding to your high-end cutlery, guaranteeing sparkling finishes.	\N	200.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:40:11.279	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
03e5ef08-6883-4fd0-9583-94a2734aad9a	SKU-014	Panda Liquid Neel	panda-liquid-neel	configurable	"Redefining Whiteness: The Liquid Neel Stronghold. For Sparkling Whiteness, Streaks Gone."\nRevitalize your dull fabrics using Panda Liquid Neel by M. Essa Chemicals. This extra strong laundry blue treatment features an ultra-concentrated formula that safely counters fabric yellowing. It disperses evenly across deep water buckets to treat white school uniforms, linens, and cotton items, delivering a bright finish without leaving patchy blue streaks or color spots.	\N	69.97	\N	\N	active	both	\N	{}	{}	2026-06-17 12:33:37.963	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
46ee9fc8-c21e-4b8c-9003-7337ea88ab68	SKU-016	Clean360 Bleach Exra Strong	clean360-bleach-exra-strong	configurable	"Redefining Cleanliness: The Bleach Stronghold — Extra Strong Liquid for Natural Freshness & Sanitation."\nAchieve the ultimate standard of heavy-duty deep purification with Clean 360 Bleach Extra Strong by M. Essa Chemicals. This commercial-grade, multi-purpose liquid bleach delivers intense stain elimination and multi-surface purification. It effortlessly restores stained fabrics while working as a high-potency sanitizer for non-porous bathroom floors, kitchen countertops, and drainage pipes.	\N	180.00	\N	\N	active	both	\N	{}	{}	2026-06-17 12:36:13.619	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
05268a8c-518a-4ff4-8691-3cfdff054382	SKU-021	Dish Wash Scourer	dish-wash-scourer	configurable	"Industrial Strength Scouring Power — Rust-Resistant & Heavy Duty"\nConquer the absolute toughest scrubbing challenges with the M. Essa Chemicals Heavy Duty Steel Scourer. Woven securely from premium-grade, rust-resistant stainless steel mesh strands, this high-performance scrub pad removes char, heavy carbon crusts, and baked-on grease residues from cast iron, ovens, and grills with minimal effort.	\N	50.00	\N	\N	disabled	both	\N	{}	{}	2026-06-17 12:46:19.087	2026-07-23 07:41:27.349	2026-07-23 07:41:27.345	1	KG
a0f5735d-d8ff-48ee-ab39-76a74fb3fcf4	sku-025	Salted Slims	salted-slims	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 12:26:45.445	2026-08-14 12:26:45.445	\N	100	G
ff11dcac-4171-4d61-99a3-b2cc9d174de1	sku-008	Chavani Papri	chavani-papri	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-09 21:39:07.645	2026-08-19 07:49:47.573	\N	80	G
3bb1a00d-202e-4c8d-8164-dce9b289a60d	sku-011	Monthar	monthar	configurable	\N	\N	1200.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:27:00.167	2026-08-15 21:50:57.847	\N	1	KG
426328ce-253f-4477-b6ad-0842c4f8da51	sku-014	Sohan Halwa	sohan-halwa	configurable	\N	\N	1300.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:31:19.45	2026-08-15 21:53:34.689	\N	1	KG
ff6d9e14-b2c1-47d9-9667-79f4410ac3c1	sku-012	Bondi Laddu	bondi-laddu	configurable	\N	\N	1000.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:28:19.091	2026-08-15 21:51:15.425	\N	1	KG
1b043109-6718-4011-b376-ac801a7aa13a	sku-015	Karachi Halwa	karachi-halwa	configurable	\N	\N	1200.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:32:48.954	2026-08-15 21:53:48.381	\N	1	KG
2f9be750-3d78-4030-8721-beca75a69b46	sku-036	Moti Bondi	moti-bondi	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 13:48:12.705	2026-08-19 08:24:00.164	\N	100	G
3edc41b7-3996-4d29-8ece-a8282dd70fda	sku-038	Mix Nimco	mix-nimco	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-14 14:02:35.038	2026-08-14 14:02:54.131	\N	100	G
2c7e550f-32a1-465e-b974-f57f152838fb	sku-039	Dal Moth	dal-moth	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-15 20:04:50.86	2026-08-15 20:04:50.86	\N	100	G
185d2b70-8297-41cf-afc5-ee14fd38464a	sku-040	Spicy Slims	spicy-slims	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-15 20:06:30.367	2026-08-15 20:06:30.367	\N	100	G
93d74064-c8a2-47bf-8eee-1065890b9787	sku-041	Masala Peanut	masala-peanut	configurable	\N	\N	220.00	\N	\N	active	both	\N	{}	{}	2026-08-15 20:09:01.432	2026-08-15 20:09:01.432	\N	180	G
cafb9e6a-4403-4838-8235-1f2b976df6a8	sku-042	Coated Peanut	coated-peanut	configurable	\N	\N	220.00	\N	\N	active	both	\N	{}	{}	2026-08-15 20:11:10.355	2026-08-15 20:11:10.355	\N	180	G
bed71484-1d2a-48b7-8947-2bba63063442	sku-043	Salted Chips	salted-chips	configurable	\N	\N	100.00	\N	\N	active	both	\N	{}	{}	2026-08-15 20:15:10.485	2026-08-15 20:15:10.485	\N	80	G
a9ec6afc-6bdb-4ce2-acfb-9e7c6f7db174	sku-044	Bareek Gathiya	bareek-gathiya	configurable	\N	\N	110.00	\N	\N	active	both	\N	{}	{}	2026-08-15 20:16:20.519	2026-08-15 20:16:20.519	\N	100	G
cada9aad-ebd1-4931-85db-1b5b6d43638a	sku-010	Khoya Pera	pera	configurable	\N	\N	1360.00	\N	\N	active	both	\N	{}	{}	2026-08-10 15:24:09.993	2026-08-15 21:50:31.744	\N	1	KG
64289463-e48b-4261-bfef-e59b622eb20e	SKU-004	Salanty	test-product-3	configurable	Pour the crunch, feel the flavor!\nSM Nimco & Sweets brings you Salanty, crispy, cheesy, and packed with the perfect kick for your snack cravings. One bite and you're hooked!	\N	30.00	\N	\N	active	both	\N	{}	{}	2026-05-04 06:50:26.021	2026-08-15 22:04:42.388	\N	30	G
\.


--
-- TOC entry 5672 (class 0 OID 21476)
-- Dependencies: 250
-- Data for Name: promotion_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_customer_groups (id, promotion_id, customer_group_id, is_excluded) FROM stdin;
\.


--
-- TOC entry 5673 (class 0 OID 21486)
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
-- TOC entry 5674 (class 0 OID 21501)
-- Dependencies: 252
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_products (id, promotion_id, product_id, variant_id, category_id) FROM stdin;
\.


--
-- TOC entry 5675 (class 0 OID 21508)
-- Dependencies: 253
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, code, name, description, type, status, discount_value, discount_type, scope, is_stackable, is_exclusive, applies_to_all_groups, conditions, usage_limit, usage_limit_per_user, current_usage, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
e7fc56cd-648e-4d62-8a07-784dfe89a278	5255	may discount offer	10% off on every product	percentage	active	10.00	percentage	cart	f	t	t	{}	\N	\N	10	\N	\N	{}	2026-05-12 08:15:49.738	2026-06-19 10:59:14.199
\.


--
-- TOC entry 5676 (class 0 OID 21536)
-- Dependencies: 254
-- Data for Name: shipping_method_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_method_customer_groups (id, shipping_method_id, customer_group_id, discount_percent, fixed_cost, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5677 (class 0 OID 21549)
-- Dependencies: 255
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_methods (id, zone_id, code, name, description, type, config, min_order_amount, max_order_amount, min_weight, max_weight, priority, is_active, courier_config, metadata, created_at, updated_at) FROM stdin;
6f8e5a1d-9615-46ea-b203-bd111e6b780b	e63ef5a1-34d3-4e97-ab58-e3fd8c17ec87	economy_shipping	Economy Shipping	Economy Shipping	weight_based	{"baseCost": 275, "costPerKg": 76, "maxWeight": 100000, "minWeight": 0, "baseCostKgLimit": 3, "estimatedDelivery": "2 to 4 Days"}	\N	\N	\N	\N	0	t	{}	{}	2026-08-18 09:25:29.433	2026-08-18 09:25:29.433
297a1b7d-87e8-4aae-b7af-e0ff722cfd13	e534a9ba-ca22-41eb-af01-f4beb9a0bf32	overland_shipping	Overland Shipping	Overland Shipping	weight_based	{"baseCost": 342, "costPerKg": 70, "maxWeight": 100000, "minWeight": 0, "baseCostKgLimit": 5, "estimatedDelivery": "4 to 6 Days"}	\N	\N	\N	\N	0	t	{}	{}	2026-08-18 09:26:57.285	2026-08-18 09:26:57.285
\.


--
-- TOC entry 5695 (class 0 OID 22534)
-- Dependencies: 273
-- Data for Name: shipping_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_rates (id, province, city, min_weight_kg, max_weight_kg, rate_amount, is_cod_available, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5678 (class 0 OID 21571)
-- Dependencies: 256
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_zones (id, name, description, coverage, priority, is_active, metadata, created_at, updated_at) FROM stdin;
e63ef5a1-34d3-4e97-ab58-e3fd8c17ec87	economy shipping zone	economy shipping zone	{"cities": [], "regions": [], "countries": ["PK"]}	0	t	{}	2026-08-18 09:24:45.766	2026-08-18 09:24:45.766
e534a9ba-ca22-41eb-af01-f4beb9a0bf32	Overland shipping	Overland shipping	{"cities": [], "regions": [], "countries": ["PK"]}	1	t	{}	2026-08-18 09:26:30.388	2026-08-18 09:26:30.388
\.


--
-- TOC entry 5689 (class 0 OID 22313)
-- Dependencies: 267
-- Data for Name: site_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_config (id, logo_url, logo_width, logo_height, updated_at, updated_by_admin_user_id, announcement_text, show_announcement) FROM stdin;
default	/uploads/site-config/4d27e294-5977-485f-b829-f0da1eeab598.png	36	36	2026-08-19 08:42:34.706	f4b18155-4045-41e5-8bfc-c9371013bbd3	Free Delivery on orders of Rs. 2000 or more!	f
\.


--
-- TOC entry 5694 (class 0 OID 22508)
-- Dependencies: 272
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_links (id, platform, url, is_active, sort_order, created_at, updated_at) FROM stdin;
5ddeabcd-f629-4c74-9b92-8331d5387f5c	facebook	https://www.instagram.com/smnimcoandsweets/	t	0	2026-08-03 07:32:52.868	2026-08-03 07:32:52.868
7c3e5c7f-166e-4d51-b530-cc492d32578a	instagram	https://www.instagram.com/smnimcoandsweets/	t	1	2026-08-03 07:32:52.868	2026-08-03 07:32:52.868
\.


--
-- TOC entry 5690 (class 0 OID 22329)
-- Dependencies: 268
-- Data for Name: store_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_settings (id, current_theme, updated_at, updated_by_admin_user_id, minimum_order_amount, free_delivery_threshold, shipping_gst_percentage) FROM stdin;
default	sm-nimco	2026-08-18 11:16:40.783	f4b18155-4045-41e5-8bfc-c9371013bbd3	300.00	8000.00	18.00
\.


--
-- TOC entry 5679 (class 0 OID 21589)
-- Dependencies: 257
-- Data for Name: storefront_filter_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_options (id, filter_id, value, label, sort_order, is_active, created_at, updated_at) FROM stdin;
8043957d-a52b-4983-8160-425b1738370d	94f01378-22dd-4868-9b23-9bb00b945f2a	100Gram	\N	0	t	2026-08-17 12:35:26.963	2026-08-17 12:35:26.963
e8262daf-1a76-4329-9f8b-bf154036aac2	94f01378-22dd-4868-9b23-9bb00b945f2a	200Gram	\N	1	t	2026-08-17 12:35:35.851	2026-08-17 12:35:35.851
5531b6e8-f0f3-4691-9f05-b58de57a5e00	94f01378-22dd-4868-9b23-9bb00b945f2a	400Gram	\N	2	t	2026-08-17 12:35:42.736	2026-08-17 12:35:42.736
f03dc746-4efb-4547-8956-8a63f7704648	94f01378-22dd-4868-9b23-9bb00b945f2a	500Gram	\N	3	t	2026-08-17 12:35:52.362	2026-08-17 12:35:52.362
219d3d46-ba77-4970-aba2-7fa2f436d120	94f01378-22dd-4868-9b23-9bb00b945f2a	1Kg	\N	4	t	2026-08-17 12:36:05.949	2026-08-17 12:36:05.949
\.


--
-- TOC entry 5680 (class 0 OID 21604)
-- Dependencies: 258
-- Data for Name: storefront_filter_tree_nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_tree_nodes (id, filter_id, parent_id, nav_link_id, sort_order, is_active, created_at, updated_at) FROM stdin;
b5a2b9ba-e5c3-4038-b12a-4b4dc58f52dc	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	\N	3509717e-86ed-4d2b-967d-a05d27ce9803	0	t	2026-08-17 12:37:22.107	2026-08-17 12:37:22.107
bd4c8ebe-dfc3-4a06-a798-fd30b785c7f9	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	\N	2c47212c-1930-4afc-b697-68c49aa95b8b	1	t	2026-08-17 12:37:22.11	2026-08-17 12:37:22.11
7255855e-b25b-461a-b660-684d92017fcd	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	\N	bc52094b-69e9-4dad-88d2-a33df19243bd	2	t	2026-08-17 12:37:22.111	2026-08-17 12:37:22.111
2d6d21f3-7f87-4c1b-b9db-a65516aedf9c	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	\N	ec68eb93-feee-48a9-8685-aa3be2563735	3	t	2026-08-17 12:37:22.113	2026-08-17 12:37:22.113
23bb3b7c-12c7-43d3-809b-94a7fac3626a	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	bd4c8ebe-dfc3-4a06-a798-fd30b785c7f9	c321a5fa-2fdb-4370-be83-1898acfb9828	0	t	2026-08-17 12:37:22.115	2026-08-17 12:37:22.115
bcba6cd3-29c6-4272-97b5-8d76481dbb22	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	2d6d21f3-7f87-4c1b-b9db-a65516aedf9c	3747b356-81e1-40b7-94cf-1ab1bfa81787	0	t	2026-08-17 12:37:22.116	2026-08-17 12:37:22.116
6beb2052-1a02-4d34-9503-09525df71a60	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	7255855e-b25b-461a-b660-684d92017fcd	773f3a51-f027-4fb1-b5fa-a5b7b1d6f5a8	0	t	2026-08-17 12:37:22.119	2026-08-17 12:37:22.119
f6bd8d88-2514-44ba-ae56-8aa4e9d16819	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	b5a2b9ba-e5c3-4038-b12a-4b4dc58f52dc	e32719a8-318c-4128-95d2-e7a3fd2114b7	0	t	2026-08-17 12:37:22.12	2026-08-17 12:37:22.12
9169a422-9627-4c8e-be80-5296863bd685	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	7255855e-b25b-461a-b660-684d92017fcd	dbc1529e-b3bd-451c-a57d-bc7fcabb52fd	1	t	2026-08-17 12:37:22.122	2026-08-17 12:37:22.122
2c843dbe-0de2-481f-9e69-b4faf3d7c28e	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	2d6d21f3-7f87-4c1b-b9db-a65516aedf9c	1f2f3e23-a421-4c39-a8a9-1bae6d117d24	1	t	2026-08-17 12:37:22.123	2026-08-17 12:37:22.123
9a86d26d-9040-45f4-86ff-9bf8ec84dc9a	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	bd4c8ebe-dfc3-4a06-a798-fd30b785c7f9	787a22e1-6bda-4dc3-b405-ebde165b4a73	1	t	2026-08-17 12:37:22.125	2026-08-17 12:37:22.125
bfe81e0b-a8ab-45af-ad62-f45165e65d69	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	b5a2b9ba-e5c3-4038-b12a-4b4dc58f52dc	81d8f5e2-1c54-491f-ab15-66531ce3d9f3	1	t	2026-08-17 12:37:22.126	2026-08-17 12:37:22.126
6f73eda5-5dd8-4284-af82-f4c2ede51bb5	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	2d6d21f3-7f87-4c1b-b9db-a65516aedf9c	a091635a-f085-43a0-a528-93b1f45686f1	2	t	2026-08-17 12:37:22.127	2026-08-17 12:37:22.127
3f0e4e0f-8032-431b-93ce-6eb4ca568fe0	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	b5a2b9ba-e5c3-4038-b12a-4b4dc58f52dc	5a69713b-9c21-4cb8-abe6-2351afb77bf1	2	t	2026-08-17 12:37:22.129	2026-08-17 12:37:22.129
873b7772-f948-4c96-a0a4-dda1db6f3153	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	7255855e-b25b-461a-b660-684d92017fcd	9ff314f6-9c2b-483f-bba2-70d2334462c2	2	t	2026-08-17 12:37:22.13	2026-08-17 12:37:22.13
a634dd9b-5dd2-4ec0-abb7-9cdc24108158	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	bd4c8ebe-dfc3-4a06-a798-fd30b785c7f9	b0e36d7f-8289-4149-a11f-ea71a1124100	2	t	2026-08-17 12:37:22.132	2026-08-17 12:37:22.132
a871b740-c8eb-4b74-8664-18d4d16856ca	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	bd4c8ebe-dfc3-4a06-a798-fd30b785c7f9	9466b13a-2278-4947-a56f-2ab2460c750b	3	t	2026-08-17 12:37:22.133	2026-08-17 12:37:22.133
0d0df919-bc63-423b-8a17-cc65af3b0ee4	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	b5a2b9ba-e5c3-4038-b12a-4b4dc58f52dc	df9801f1-83fb-4a30-963a-6645680f1c59	3	t	2026-08-17 12:37:22.135	2026-08-17 12:37:22.135
4fd07f80-84a1-4c5a-b55c-a3490e099986	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	2d6d21f3-7f87-4c1b-b9db-a65516aedf9c	6ca36681-0ad9-45dd-89e0-cfdf43b8103a	3	t	2026-08-17 12:37:22.136	2026-08-17 12:37:22.136
3fb82f06-8958-4177-9716-1177e7ad01f0	cc9878ce-bbc3-4bb8-b2d0-148df1e54171	7255855e-b25b-461a-b660-684d92017fcd	bf7a2c67-a99c-4757-950f-2853ac906bbc	3	t	2026-08-17 12:37:22.137	2026-08-17 12:37:22.137
\.


--
-- TOC entry 5681 (class 0 OID 21616)
-- Dependencies: 259
-- Data for Name: storefront_filters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filters (id, code, name, kind, sort_order, is_active, created_at, updated_at) FROM stdin;
1925e01b-2ad9-4c5f-a59b-ca0d381c9e5d	price	Price	PRICE	0	t	2026-06-18 14:31:12.351	2026-08-17 12:33:45.477
94f01378-22dd-4868-9b23-9bb00b945f2a	weight	Weight	ATTRIBUTE	2	t	2026-08-17 12:34:42.192	2026-08-17 12:34:42.192
cc9878ce-bbc3-4bb8-b2d0-148df1e54171	category		CATEGORY	1	t	2026-08-17 12:37:19.128	2026-08-17 12:37:19.128
\.


--
-- TOC entry 5682 (class 0 OID 21630)
-- Dependencies: 260
-- Data for Name: storefront_nav_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_nav_links (id, label, secondary_label, href, sort_order, is_active, kind, created_at, updated_at, zone, parent_id, category_id, open_mega_menu, banner_image_url, banner_href, banner_alt) FROM stdin;
00000000-0000-0000-0000-00000000e003	Track order	\N	/track-order	20	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e005	Cart	\N	/cart	40	t	LINK	2026-05-13 11:15:47.684	2026-05-13 11:15:47.684	header	\N	\N	f	\N	\N	\N
3747b356-81e1-40b7-94cf-1ab1bfa81787	Black Pepper Finger Chips	\N	http://localhost:3001/products/test-product-1	0	t	LINK	2026-08-17 12:29:08.83	2026-08-17 12:29:08.83	mega	ec68eb93-feee-48a9-8685-aa3be2563735	\N	f	\N	\N	\N
1f2f3e23-a421-4c39-a8a9-1bae6d117d24	Crinkle Chips Ketchup	\N	http://localhost:3001/products/chips	1	t	LINK	2026-08-17 12:29:38.553	2026-08-17 12:29:38.553	mega	ec68eb93-feee-48a9-8685-aa3be2563735	\N	f	\N	\N	\N
a091635a-f085-43a0-a528-93b1f45686f1	Hyderabadi Chips	\N	http://localhost:3001/products/hyderabadi-chips	2	t	LINK	2026-08-17 12:30:15.547	2026-08-17 12:31:29.216	mega	ec68eb93-feee-48a9-8685-aa3be2563735	\N	f	\N	\N	\N
6ca36681-0ad9-45dd-89e0-cfdf43b8103a	Masala Chips	\N	http://localhost:3001/products/masala-chips	3	t	LINK	2026-08-17 12:31:08.89	2026-08-17 12:32:11.966	mega	ec68eb93-feee-48a9-8685-aa3be2563735	\N	f	\N	\N	\N
9ff314f6-9c2b-483f-bba2-70d2334462c2	Chavani Papri	\N	http://localhost:3001/products/chavani-papri	2	t	LINK	2026-08-17 12:26:23.082	2026-08-19 07:53:22.707	mega	bc52094b-69e9-4dad-88d2-a33df19243bd	\N	f	\N	\N	\N
3509717e-86ed-4d2b-967d-a05d27ce9803	Sweets	\N	/	0	t	LINK	2026-05-14 06:09:17.438	2026-08-17 11:37:58.166	mega	\N	\N	f	\N	\N	\N
e32719a8-318c-4128-95d2-e7a3fd2114b7	Khopra Pak	\N	http://localhost:3001/products/khopra-pak	0	t	LINK	2026-05-14 06:10:17.76	2026-08-17 11:43:38.738	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
81d8f5e2-1c54-491f-ab15-66531ce3d9f3	Sohan Halwa	\N	http://localhost:3001/products/sohan-halwa	1	t	LINK	2026-05-14 06:10:32.81	2026-08-17 11:43:59.254	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
00000000-0000-0000-0000-00000000e002	Products	Categories	/products	10	t	LINK	2026-05-13 11:15:47.684	2026-08-19 08:16:47.022	header	\N	\N	t	http://localhost:3000/uploads/storefront-nav/16f50f3d-9799-456e-a76c-1fb146f96263.jpeg	\N	\N
5a69713b-9c21-4cb8-abe6-2351afb77bf1	Karachi Halwa	\N	http://localhost:3001/products/karachi-halwa	2	t	LINK	2026-08-17 11:52:21.394	2026-08-17 11:52:21.394	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
df9801f1-83fb-4a30-963a-6645680f1c59	Kalakand	\N	http://localhost:3001/products/kalakand	3	t	LINK	2026-08-17 11:53:24.996	2026-08-17 11:53:24.996	mega	3509717e-86ed-4d2b-967d-a05d27ce9803	\N	f	\N	\N	\N
c321a5fa-2fdb-4370-be83-1898acfb9828	Bhel Puri	\N	http://localhost:3001/products/bhel-puri	0	t	LINK	2026-05-13 10:41:15.89	2026-08-17 11:54:46.346	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
787a22e1-6bda-4dc3-b405-ebde165b4a73	Mix Nimco	\N	http://localhost:3001/products/mix-nimco	1	t	LINK	2026-06-17 12:59:09.457	2026-08-17 11:55:18.396	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
b0e36d7f-8289-4149-a11f-ea71a1124100	Spicy Slims	\N	http://localhost:3001/products/spicy-slims	2	t	LINK	2026-07-23 10:33:34.619	2026-08-17 11:55:57.29	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
2c47212c-1930-4afc-b697-68c49aa95b8b	Nimco	\N	http://localhost:3001/products/gathiya	1	t	LINK	2026-05-13 10:40:56.931	2026-08-17 12:21:10.666	mega	\N	\N	f	\N	\N	\N
9466b13a-2278-4947-a56f-2ab2460c750b	Gathiya	\N	http://localhost:3001/products/gathiya	3	t	LINK	2026-08-17 12:21:30.233	2026-08-17 12:21:30.233	mega	2c47212c-1930-4afc-b697-68c49aa95b8b	\N	f	\N	\N	\N
773f3a51-f027-4fb1-b5fa-a5b7b1d6f5a8	Chat Papri	\N	http://localhost:3001/products/test-product-4	0	t	LINK	2026-08-17 12:22:21.019	2026-08-17 12:22:21.019	mega	bc52094b-69e9-4dad-88d2-a33df19243bd	\N	f	\N	\N	\N
bc52094b-69e9-4dad-88d2-a33df19243bd	Papri & Peanuts	\N	/	2	t	LINK	2026-08-17 12:21:46.117	2026-08-17 12:24:36.299	mega	\N	\N	f	\N	\N	\N
dbc1529e-b3bd-451c-a57d-bc7fcabb52fd	Coated Peanut	\N	http://localhost:3001/products/coated-peanut	1	t	LINK	2026-08-17 12:25:07.436	2026-08-17 12:25:07.436	mega	bc52094b-69e9-4dad-88d2-a33df19243bd	\N	f	\N	\N	\N
bf7a2c67-a99c-4757-950f-2853ac906bbc	Masala Peanut	\N	http://localhost:3001/products/masala-peanut	3	t	LINK	2026-08-17 12:26:49.893	2026-08-17 12:26:49.893	mega	bc52094b-69e9-4dad-88d2-a33df19243bd	\N	f	\N	\N	\N
ec68eb93-feee-48a9-8685-aa3be2563735	Chips	\N	/	3	t	LINK	2026-08-17 12:28:24.898	2026-08-17 12:28:24.898	mega	\N	\N	f	\N	\N	\N
\.


--
-- TOC entry 5683 (class 0 OID 21652)
-- Dependencies: 261
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, email, source, created_at, updated_at) FROM stdin;
a250fe70-372b-4bb2-95cc-da0e7154c67f	smhuzaifa525@gmail.com	account	2026-05-12 07:44:19.981	2026-05-12 07:44:19.981
7c9a6acf-cf04-4a9d-821f-255fef72395a	nomanfoodspk@gmail.com	coming-soon	2026-08-03 07:13:32.316	2026-08-03 07:13:32.316
\.


--
-- TOC entry 5684 (class 0 OID 21660)
-- Dependencies: 262
-- Data for Name: tax_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_classes (id, code, name, description, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5685 (class 0 OID 21673)
-- Dependencies: 263
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taxes (id, tax_class_id, country, region, rate, is_inclusive, is_active, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5686 (class 0 OID 21691)
-- Dependencies: 264
-- Data for Name: variant_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variant_option_values (variant_id, option_id, value_id) FROM stdin;
f8588e5d-9c08-46fd-a898-9aa2f84906c8	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
51240564-8eb4-4280-9a16-61eeba638f77	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
33973007-0839-4dd3-8c6f-af8b8ac76ffb	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
90aaf524-b20d-4ccb-a762-81ed063917e8	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
a1ce5c73-d36d-45ff-b59f-426ed7d072bc	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
bff4e473-e6be-454e-ab4f-98f7a6fa847d	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
e35461a9-65b7-4ab2-a26a-d1d3d46bfb9a	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
efbf85a4-a7b1-4ead-83db-4c7df04e3790	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
484a9ea0-79ac-4b5e-996c-c4d376c1803e	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
4b64825c-8ab1-459d-b165-3c7d24f2ca40	d06da49b-297e-48d0-bead-f36769d3472e	b1129a0b-6c8e-47f7-aa9d-0a2ca96445c5
f3412483-d994-4600-89c0-6f06d2e40ef8	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
d8ac9ee5-3071-471f-ba8f-c7562e6e20f1	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
8a8ab41b-1143-41d7-8dbf-3d6317a6eaac	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
fd301154-c132-4757-b8c2-4dbfb0d4da47	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
21cd4993-8fab-4fe5-8b1f-5a69661eb6e9	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
c916c054-a802-4e98-8c74-8682c10794f7	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
d6756dc5-efdd-414e-a06f-08dee6f14af9	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
01db20e4-da5e-413d-9d59-afd69e903448	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
bd42445d-9f3c-40f4-9cdf-a6f2e19947b5	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
3304f70d-4296-4e6e-8af3-2296b477bb76	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
df6ef30f-11b7-4d9d-a11f-7dde056894ab	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
9ba01678-18ec-43d8-aa86-1324fe5ae531	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
818bb94d-4faf-4af2-8e48-ccf3bb712d4c	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
d971ec3a-610e-4320-b6a2-13cced2b87ac	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
bad2686d-a6bf-41f6-bd64-40825298a3c5	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
2b4f665e-d2cd-4633-8e6f-e78ef1a17ca8	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
cba4cb74-7292-4609-8c4d-1af78cbd7cbd	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
726c60a2-c0eb-4913-8a36-a867105b693d	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
19ccc911-047d-444b-86d0-3ba6ec03334f	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
9a320130-4450-4711-a7a8-52fcb50022cf	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
2d89e90f-94d1-4532-a36f-9d2171e9dfd7	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
821bb87e-92d3-4ed7-98ad-0ad328271b2c	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
3dbb8353-749c-4007-966b-7709efc0806d	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
17f49cb8-5877-43cb-aae8-ff336636ee44	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
3fe5a35e-51a0-4a3f-ace9-d47273a5086c	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
3fd2dd57-5c35-455b-9c00-b8a766c99af8	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
8d2ae540-cc15-49e3-b014-58c260c9002d	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
f3ad0845-7231-4cad-8081-e6a4ebfcfaa4	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
014ae71e-970a-4a6f-aa77-d16bcf7ff5cc	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
2edfd8cf-1fc1-420d-956a-4641349eebc3	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
b414b725-03bb-4a19-90e3-fa9607592a4c	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
d0290fe1-2312-459e-be85-97fba9a5a1a6	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
28825a16-ce19-45ca-be5a-c61e7d62b418	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
fc07ff65-d84c-4b53-9599-a4d3d797d367	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
6b83fd33-f2a0-44f6-aefa-6040ddebfe38	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
698a8acc-c5bd-43a5-89dd-e122bf57834e	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
f7256127-9f87-4def-97d6-ef4dfa0aa01a	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
dab15350-43b5-4b34-b7b5-19109578dfb6	a39db598-111e-4007-bf54-f564b2c1f587	08b9ab65-eba3-4875-a761-485f6196f74e
077cabf2-9484-4b1f-8ba8-d2960bc6e20f	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
a5eda025-6ee1-469a-8937-6280547a3347	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
08de828e-48ee-4791-adbd-ffeeaeb98bea	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
08f139df-d8b4-4ee7-9e93-61317b186a00	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
70f3a35c-1a0f-4cfa-9c33-8810c2a04913	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
f36e0fb5-3f6e-40a9-93bd-4ea16eb3b7d1	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
92735483-f886-44e0-8741-c482c64190a6	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
7dccb3d2-1700-4b01-8ae2-3b27defd96e4	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
db9babba-16bb-467b-993a-a82e790c2937	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
ea7a85c4-ee49-4236-8415-9ef721211e62	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
d7c62cda-b7cf-43c3-806b-e62f07d4db78	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
99e65965-36d9-4942-905d-0bb4f1ff44a4	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
97e0bb0b-e90b-417d-9cc7-b1b2230b18cf	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
4c3c762a-ef77-48cf-95d8-ca9781e23939	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
39b4f942-20a1-4c7f-afa3-5d294305faf0	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
8f287418-9523-43fd-9074-ac6381aff7d0	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
9e606a21-af89-4d73-b9bf-4472ff252b36	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
1a42be08-74ff-45a1-b314-9e8a55dfb574	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
150978ca-a27a-4fe9-ad9c-a7c78fc625b9	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
5b793fee-7b4c-488b-963a-d2dfcff60d1b	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
5d134927-3268-4c92-93d9-681783b1ef2f	a39db598-111e-4007-bf54-f564b2c1f587	325293fc-0fd3-4b8f-af1c-0c5f92b0d8d7
e777530b-83de-4e6b-8b54-5db5ea6e97a4	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
c354d84c-c71d-403e-a2b9-312bd9d226b8	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
bef9d1f2-0bff-48ac-b287-28cde0bf9d10	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
7f217385-809c-43e1-963d-b4ba213ff7ea	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
86fe4a20-100b-4f78-a8d0-c6d47553ce93	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
02479d88-36af-4f24-bcc5-3961eabd5b44	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
d72ede7d-51a0-4b8a-897e-de58e6ae1516	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
3a9d2b1a-8683-4305-8e74-9b8ef9975ecf	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
186b320e-1ce1-4242-9fe0-a2382c9a3cff	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
fc990784-5496-43ed-91d2-20dc6d04b4c8	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
c85a4b4a-5f36-4754-b5d2-6165b5bdf977	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
b375a668-b488-4aa7-9ea1-d8fe0fd2db2d	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
4cfa35e8-6818-427d-b431-2801720af628	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
26db009d-b92e-4cc0-8240-241abff4f821	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
db89aec9-bb55-4000-872f-4214f59b138d	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
2fcecb5b-c280-4348-87bd-d644b4e671d4	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
1b58621b-3d2a-4e9d-ae99-d7d51f2d7d2e	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
ab8c8299-d521-4f51-b6a8-1a54272aa64f	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
1acc5109-eb3a-4edb-a7d4-ab5c0acee9a8	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
5727189c-7cc0-4ddf-a4a2-db701d7b246b	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
f9afe415-357b-4495-9edd-18cd2b566964	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
665e39cf-cb52-465c-afa4-f628fc6d3615	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
32db76b1-c4d2-4c23-a520-a54607b6e741	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
1822b85a-61a6-4942-bcb3-1295d7bc8cea	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
f4a8ef89-5c3d-4146-9b16-f3fd41fa2442	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
a1ad008c-9ad0-4db3-9932-bc48e58ecdb8	d06da49b-297e-48d0-bead-f36769d3472e	047e43eb-fee5-43fe-a196-a0693d6b5464
71355584-5775-4be1-806a-f3c9575f9e31	d06da49b-297e-48d0-bead-f36769d3472e	047e43eb-fee5-43fe-a196-a0693d6b5464
e00ecc16-14e6-448e-b745-bf555ffe3d3f	d06da49b-297e-48d0-bead-f36769d3472e	047e43eb-fee5-43fe-a196-a0693d6b5464
2be2da7e-c395-4ea3-8ea9-2abcc7f79b58	d06da49b-297e-48d0-bead-f36769d3472e	3a83fd97-e566-44d0-9d6d-ab568bae9f69
6811c0c2-1a06-4eb9-8e28-dabb18a431cc	d06da49b-297e-48d0-bead-f36769d3472e	20f4ffb2-f54d-49c6-83b9-0379a446e08d
3a50b8f0-ecb7-4ef4-a8c5-c648c55b5b6e	d06da49b-297e-48d0-bead-f36769d3472e	6675f571-9c67-4158-86a4-a80afbeea01a
85666d70-c39f-4337-ac51-60d5f4488c1e	d06da49b-297e-48d0-bead-f36769d3472e	45f08eac-42f5-4f20-9b64-e229f75c4df4
d3dd1a88-1715-4840-bef4-d5bc7bd90825	d06da49b-297e-48d0-bead-f36769d3472e	2583ce01-e9d6-41c6-997d-03085c3a6b92
44ed96d0-8f82-4911-9a93-ab8eb6494607	d06da49b-297e-48d0-bead-f36769d3472e	83a2dbc1-7521-4ccc-973d-8662901ba911
07556f02-fb3e-4da1-86e9-c56d68907342	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
87555558-4a6c-44c3-ba89-106bb3760e08	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
3fc3b9ae-162d-4666-9e1d-62ca4b683ce1	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
59068913-f30c-47de-b871-39a7a999be2e	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
0ab2a210-3672-4ec1-83c7-d62d89660171	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
1cdea472-3122-4629-88b2-59a8415d0e92	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
f7c1809a-924d-4752-83b3-278ddfe0a86e	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
1cd4a1fd-7be4-4536-a9f8-fb5262991f0b	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
84fb9d05-ccba-4e7b-9768-babc21a071a0	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
57d63dcd-b5ff-4670-9ba5-f25dbc7c2143	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
03314898-7431-4813-963b-c114c9a5a7b1	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
1fb09500-0aea-45cd-98c8-027a6b3e5081	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
5c8de76c-f0f9-4651-a4e0-aacb4cdcbc3c	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
35a641be-437b-4adb-b950-4253633982ff	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
5d316832-1b46-4461-916a-334c84d31170	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
f5688887-d66e-4e88-ae6f-68c9fca398fb	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
1a40c60b-25e5-4daf-a894-6c5ff37c21ae	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
a2f2e676-56a8-4415-8834-a7c8824b6a13	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
0724246d-0578-4106-837f-ed0d60a79e46	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
4176054d-5f79-4916-8ae3-6ea1c4ceecfe	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
26d5e0a6-ff90-4b3f-af55-7eb02c45cc97	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
59e51fb0-c229-42c1-827e-4e36005ff97b	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
b0bac037-5a47-4b73-a76e-cd3290a4c139	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
bc2cbe51-541e-4bd6-a6dc-18ad784d0da2	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
cf7b7300-fe24-405f-9349-ab0c0e57e28d	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
c7cf9c18-b833-4f4c-b8b7-4a307b71fc3a	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
08c6f0a0-45c4-478e-b8b3-73a6bfd2425c	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
ab01460a-742c-4df1-88a2-d10338e88c7f	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
7fbcd890-2de8-48c9-a6fd-0baec249480b	d06da49b-297e-48d0-bead-f36769d3472e	40031c52-0288-4c97-8fcc-1670b5ad4dbd
30cb08f1-d606-4f57-a942-98d856b30eb4	d06da49b-297e-48d0-bead-f36769d3472e	500b45bd-6add-4bb4-80dc-d88f8ee46cc7
b7e6e695-bc83-4b05-9939-35b01370313f	d06da49b-297e-48d0-bead-f36769d3472e	91979004-6cae-4a76-9ff5-9444026de0f6
\.


--
-- TOC entry 5693 (class 0 OID 22477)
-- Dependencies: 271
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (id, customer_id, product_id, created_at) FROM stdin;
\.


--
-- TOC entry 5163 (class 2606 OID 21700)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5167 (class 2606 OID 21702)
-- Name: account_creation_tokens account_creation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_creation_tokens
    ADD CONSTRAINT account_creation_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5172 (class 2606 OID 21704)
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5174 (class 2606 OID 21706)
-- Name: admin_role_permissions admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5176 (class 2606 OID 21708)
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5179 (class 2606 OID 21710)
-- Name: admin_user_roles admin_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 5184 (class 2606 OID 21712)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5402 (class 2606 OID 22312)
-- Name: analytics_ga4_settings analytics_ga4_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_ga4_settings
    ADD CONSTRAINT analytics_ga4_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5417 (class 2606 OID 22377)
-- Name: bundle_deal_items bundle_deal_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_deal_items
    ADD CONSTRAINT bundle_deal_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5409 (class 2606 OID 22363)
-- Name: bundle_deals bundle_deals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_deals
    ADD CONSTRAINT bundle_deals_pkey PRIMARY KEY (id);


--
-- TOC entry 5189 (class 2606 OID 21714)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5195 (class 2606 OID 21716)
-- Name: cms_banner_sliders cms_banner_sliders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_sliders
    ADD CONSTRAINT cms_banner_sliders_pkey PRIMARY KEY (id);


--
-- TOC entry 5197 (class 2606 OID 21718)
-- Name: cms_banner_slides cms_banner_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_pkey PRIMARY KEY (id);


--
-- TOC entry 5203 (class 2606 OID 21720)
-- Name: cms_blocks cms_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_blocks
    ADD CONSTRAINT cms_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5205 (class 2606 OID 21722)
-- Name: cms_pages cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_pages
    ADD CONSTRAINT cms_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5438 (class 2606 OID 22588)
-- Name: courier_cities courier_cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_cities
    ADD CONSTRAINT courier_cities_pkey PRIMARY KEY (id);


--
-- TOC entry 5433 (class 2606 OID 22571)
-- Name: courier_zones courier_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_zones
    ADD CONSTRAINT courier_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5211 (class 2606 OID 21724)
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5214 (class 2606 OID 21726)
-- Name: customer_groups customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_groups
    ADD CONSTRAINT customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5223 (class 2606 OID 21728)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 5228 (class 2606 OID 21730)
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5234 (class 2606 OID 21732)
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 5398 (class 2606 OID 22201)
-- Name: mail_mailboxes mail_mailboxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mail_mailboxes
    ADD CONSTRAINT mail_mailboxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5238 (class 2606 OID 21734)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5244 (class 2606 OID 21736)
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- TOC entry 5251 (class 2606 OID 21738)
-- Name: order_taxes order_taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5259 (class 2606 OID 21740)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 21742)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5272 (class 2606 OID 21744)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5276 (class 2606 OID 21746)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- TOC entry 5279 (class 2606 OID 21748)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5290 (class 2606 OID 21750)
-- Name: product_option_values_on_products product_option_values_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_pkey PRIMARY KEY (product_id, option_id, value_id);


--
-- TOC entry 5288 (class 2606 OID 21752)
-- Name: product_option_values product_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_pkey PRIMARY KEY (id);


--
-- TOC entry 5300 (class 2606 OID 21754)
-- Name: product_options_on_products product_options_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_pkey PRIMARY KEY (product_id, option_id);


--
-- TOC entry 5297 (class 2606 OID 21756)
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5304 (class 2606 OID 21758)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5309 (class 2606 OID 21760)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5318 (class 2606 OID 21762)
-- Name: promotion_customer_groups promotion_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5329 (class 2606 OID 21764)
-- Name: promotion_logs promotion_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5333 (class 2606 OID 21766)
-- Name: promotion_products promotion_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_pkey PRIMARY KEY (id);


--
-- TOC entry 5340 (class 2606 OID 21768)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 5346 (class 2606 OID 21770)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5352 (class 2606 OID 21772)
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5428 (class 2606 OID 22550)
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 5357 (class 2606 OID 21774)
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5404 (class 2606 OID 22326)
-- Name: site_config site_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_config
    ADD CONSTRAINT site_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5425 (class 2606 OID 22524)
-- Name: social_links social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5406 (class 2606 OID 22340)
-- Name: store_settings store_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_settings
    ADD CONSTRAINT store_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5362 (class 2606 OID 21776)
-- Name: storefront_filter_options storefront_filter_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5367 (class 2606 OID 21778)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_pkey PRIMARY KEY (id);


--
-- TOC entry 5371 (class 2606 OID 21780)
-- Name: storefront_filters storefront_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filters
    ADD CONSTRAINT storefront_filters_pkey PRIMARY KEY (id);


--
-- TOC entry 5374 (class 2606 OID 21782)
-- Name: storefront_nav_links storefront_nav_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5379 (class 2606 OID 21784)
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 5383 (class 2606 OID 21786)
-- Name: tax_classes tax_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_classes
    ADD CONSTRAINT tax_classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5388 (class 2606 OID 21788)
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5393 (class 2606 OID 21790)
-- Name: variant_option_values variant_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_pkey PRIMARY KEY (variant_id, option_id);


--
-- TOC entry 5421 (class 2606 OID 22488)
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5164 (class 1259 OID 21791)
-- Name: account_creation_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_email_idx ON public.account_creation_tokens USING btree (email);


--
-- TOC entry 5165 (class 1259 OID 21792)
-- Name: account_creation_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_expires_at_idx ON public.account_creation_tokens USING btree (expires_at);


--
-- TOC entry 5168 (class 1259 OID 21793)
-- Name: account_creation_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_token_idx ON public.account_creation_tokens USING btree (token);


--
-- TOC entry 5169 (class 1259 OID 21794)
-- Name: account_creation_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX account_creation_tokens_token_key ON public.account_creation_tokens USING btree (token);


--
-- TOC entry 5170 (class 1259 OID 21795)
-- Name: admin_permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_permissions_key_key ON public.admin_permissions USING btree (key);


--
-- TOC entry 5177 (class 1259 OID 21796)
-- Name: admin_roles_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_roles_slug_key ON public.admin_roles USING btree (slug);


--
-- TOC entry 5180 (class 1259 OID 21797)
-- Name: admin_users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_email_idx ON public.admin_users USING btree (email);


--
-- TOC entry 5181 (class 1259 OID 21798)
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- TOC entry 5182 (class 1259 OID 21799)
-- Name: admin_users_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_is_active_idx ON public.admin_users USING btree (is_active);


--
-- TOC entry 5414 (class 1259 OID 22383)
-- Name: bundle_deal_items_bundle_deal_id_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bundle_deal_items_bundle_deal_id_position_idx ON public.bundle_deal_items USING btree (bundle_deal_id, "position");


--
-- TOC entry 5415 (class 1259 OID 22384)
-- Name: bundle_deal_items_bundle_deal_id_product_id_variant_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bundle_deal_items_bundle_deal_id_product_id_variant_id_key ON public.bundle_deal_items USING btree (bundle_deal_id, product_id, variant_id);


--
-- TOC entry 5407 (class 1259 OID 22382)
-- Name: bundle_deals_is_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bundle_deals_is_featured_idx ON public.bundle_deals USING btree (is_featured);


--
-- TOC entry 5410 (class 1259 OID 22379)
-- Name: bundle_deals_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bundle_deals_slug_idx ON public.bundle_deals USING btree (slug);


--
-- TOC entry 5411 (class 1259 OID 22378)
-- Name: bundle_deals_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bundle_deals_slug_key ON public.bundle_deals USING btree (slug);


--
-- TOC entry 5412 (class 1259 OID 22380)
-- Name: bundle_deals_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bundle_deals_status_deleted_at_idx ON public.bundle_deals USING btree (status, deleted_at);


--
-- TOC entry 5413 (class 1259 OID 22381)
-- Name: bundle_deals_valid_from_valid_to_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bundle_deals_valid_from_valid_to_idx ON public.bundle_deals USING btree (valid_from, valid_to);


--
-- TOC entry 5185 (class 1259 OID 21800)
-- Name: categories_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_is_active_idx ON public.categories USING btree (is_active);


--
-- TOC entry 5186 (class 1259 OID 32570)
-- Name: categories_is_featured_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_is_featured_is_active_idx ON public.categories USING btree (is_featured, is_active);


--
-- TOC entry 5187 (class 1259 OID 21801)
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);


--
-- TOC entry 5190 (class 1259 OID 21802)
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- TOC entry 5191 (class 1259 OID 21803)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 5192 (class 1259 OID 21804)
-- Name: cms_banner_sliders_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_sliders_identifier_is_active_idx ON public.cms_banner_sliders USING btree (identifier, is_active);


--
-- TOC entry 5193 (class 1259 OID 21805)
-- Name: cms_banner_sliders_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_banner_sliders_identifier_key ON public.cms_banner_sliders USING btree (identifier);


--
-- TOC entry 5198 (class 1259 OID 21806)
-- Name: cms_banner_slides_slider_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_is_active_idx ON public.cms_banner_slides USING btree (slider_id, is_active);


--
-- TOC entry 5199 (class 1259 OID 21807)
-- Name: cms_banner_slides_slider_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_sort_order_idx ON public.cms_banner_slides USING btree (slider_id, sort_order);


--
-- TOC entry 5200 (class 1259 OID 21808)
-- Name: cms_blocks_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_blocks_identifier_is_active_idx ON public.cms_blocks USING btree (identifier, is_active);


--
-- TOC entry 5201 (class 1259 OID 21809)
-- Name: cms_blocks_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_blocks_identifier_key ON public.cms_blocks USING btree (identifier);


--
-- TOC entry 5206 (class 1259 OID 21810)
-- Name: cms_pages_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_pages_slug_key ON public.cms_pages USING btree (slug);


--
-- TOC entry 5207 (class 1259 OID 21811)
-- Name: cms_pages_slug_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_slug_status_idx ON public.cms_pages USING btree (slug, status);


--
-- TOC entry 5208 (class 1259 OID 21812)
-- Name: cms_pages_status_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_status_updated_at_idx ON public.cms_pages USING btree (status, updated_at DESC);


--
-- TOC entry 5434 (class 1259 OID 22590)
-- Name: courier_cities_city_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX courier_cities_city_code_key ON public.courier_cities USING btree (city_code);


--
-- TOC entry 5435 (class 1259 OID 22594)
-- Name: courier_cities_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courier_cities_is_active_idx ON public.courier_cities USING btree (is_active);


--
-- TOC entry 5436 (class 1259 OID 22593)
-- Name: courier_cities_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courier_cities_name_idx ON public.courier_cities USING btree (name);


--
-- TOC entry 5439 (class 1259 OID 22591)
-- Name: courier_cities_province_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courier_cities_province_idx ON public.courier_cities USING btree (province);


--
-- TOC entry 5440 (class 1259 OID 22592)
-- Name: courier_cities_zone_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courier_cities_zone_id_idx ON public.courier_cities USING btree (zone_id);


--
-- TOC entry 5431 (class 1259 OID 22589)
-- Name: courier_zones_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX courier_zones_code_key ON public.courier_zones USING btree (code);


--
-- TOC entry 5209 (class 1259 OID 21813)
-- Name: customer_addresses_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_addresses_customer_id_idx ON public.customer_addresses USING btree (customer_id);


--
-- TOC entry 5212 (class 1259 OID 21814)
-- Name: customer_groups_is_default_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_is_default_idx ON public.customer_groups USING btree (is_default);


--
-- TOC entry 5215 (class 1259 OID 21815)
-- Name: customer_groups_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_tax_class_id_idx ON public.customer_groups USING btree (tax_class_id);


--
-- TOC entry 5216 (class 1259 OID 21816)
-- Name: customers_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_customer_group_id_idx ON public.customers USING btree (customer_group_id);


--
-- TOC entry 5217 (class 1259 OID 21817)
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- TOC entry 5218 (class 1259 OID 21818)
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- TOC entry 5219 (class 1259 OID 22170)
-- Name: customers_email_verification_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_verification_token_idx ON public.customers USING btree (email_verification_token);


--
-- TOC entry 5220 (class 1259 OID 22169)
-- Name: customers_email_verification_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_verification_token_key ON public.customers USING btree (email_verification_token);


--
-- TOC entry 5221 (class 1259 OID 21819)
-- Name: customers_is_guest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_is_guest_idx ON public.customers USING btree (is_guest);


--
-- TOC entry 5224 (class 1259 OID 22172)
-- Name: customers_reset_password_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_reset_password_token_idx ON public.customers USING btree (reset_password_token);


--
-- TOC entry 5225 (class 1259 OID 22171)
-- Name: customers_reset_password_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_reset_password_token_key ON public.customers USING btree (reset_password_token);


--
-- TOC entry 5226 (class 1259 OID 21820)
-- Name: inventory_items_available_quantity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_available_quantity_idx ON public.inventory_items USING btree (available_quantity);


--
-- TOC entry 5229 (class 1259 OID 21821)
-- Name: inventory_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_product_id_idx ON public.inventory_items USING btree (product_id);


--
-- TOC entry 5230 (class 1259 OID 21822)
-- Name: inventory_items_product_id_variant_id_warehouse_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inventory_items_product_id_variant_id_warehouse_id_key ON public.inventory_items USING btree (product_id, variant_id, warehouse_id);


--
-- TOC entry 5231 (class 1259 OID 21823)
-- Name: inventory_items_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_variant_id_idx ON public.inventory_items USING btree (variant_id);


--
-- TOC entry 5232 (class 1259 OID 21824)
-- Name: inventory_reservations_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_expires_at_idx ON public.inventory_reservations USING btree (expires_at);


--
-- TOC entry 5235 (class 1259 OID 21825)
-- Name: inventory_reservations_reference_type_reference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_reference_type_reference_id_idx ON public.inventory_reservations USING btree (reference_type, reference_id);


--
-- TOC entry 5396 (class 1259 OID 22202)
-- Name: mail_mailboxes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mail_mailboxes_code_key ON public.mail_mailboxes USING btree (code);


--
-- TOC entry 5399 (class 1259 OID 22203)
-- Name: mail_mailboxes_purpose_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mail_mailboxes_purpose_is_active_idx ON public.mail_mailboxes USING btree (purpose, is_active);


--
-- TOC entry 5400 (class 1259 OID 22204)
-- Name: mail_mailboxes_purpose_is_default_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mail_mailboxes_purpose_is_default_idx ON public.mail_mailboxes USING btree (purpose, is_default);


--
-- TOC entry 5236 (class 1259 OID 21826)
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- TOC entry 5239 (class 1259 OID 21827)
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- TOC entry 5240 (class 1259 OID 21828)
-- Name: order_shipping_courier_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_courier_code_idx ON public.order_shipping USING btree (courier_code);


--
-- TOC entry 5241 (class 1259 OID 21829)
-- Name: order_shipping_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_order_id_idx ON public.order_shipping USING btree (order_id);


--
-- TOC entry 5242 (class 1259 OID 21830)
-- Name: order_shipping_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX order_shipping_order_id_key ON public.order_shipping USING btree (order_id);


--
-- TOC entry 5245 (class 1259 OID 21831)
-- Name: order_shipping_shipped_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipped_at_idx ON public.order_shipping USING btree (shipped_at);


--
-- TOC entry 5246 (class 1259 OID 21832)
-- Name: order_shipping_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipping_method_id_idx ON public.order_shipping USING btree (shipping_method_id);


--
-- TOC entry 5247 (class 1259 OID 21833)
-- Name: order_shipping_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_status_idx ON public.order_shipping USING btree (status);


--
-- TOC entry 5248 (class 1259 OID 21834)
-- Name: order_shipping_tracking_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_tracking_number_idx ON public.order_shipping USING btree (tracking_number);


--
-- TOC entry 5249 (class 1259 OID 21835)
-- Name: order_taxes_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_order_id_idx ON public.order_taxes USING btree (order_id);


--
-- TOC entry 5252 (class 1259 OID 21836)
-- Name: order_taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_class_id_idx ON public.order_taxes USING btree (tax_class_id);


--
-- TOC entry 5253 (class 1259 OID 21837)
-- Name: order_taxes_tax_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_id_idx ON public.order_taxes USING btree (tax_id);


--
-- TOC entry 5254 (class 1259 OID 21838)
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at DESC);


--
-- TOC entry 5255 (class 1259 OID 21839)
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- TOC entry 5256 (class 1259 OID 21840)
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- TOC entry 5257 (class 1259 OID 21841)
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- TOC entry 5260 (class 1259 OID 21842)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 5261 (class 1259 OID 21843)
-- Name: payment_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_code_idx ON public.payment_methods USING btree (code);


--
-- TOC entry 5262 (class 1259 OID 21844)
-- Name: payment_methods_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_methods_code_key ON public.payment_methods USING btree (code);


--
-- TOC entry 5263 (class 1259 OID 21845)
-- Name: payment_methods_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_is_active_idx ON public.payment_methods USING btree (is_active);


--
-- TOC entry 5266 (class 1259 OID 21846)
-- Name: payment_methods_provider_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_provider_idx ON public.payment_methods USING btree (provider);


--
-- TOC entry 5267 (class 1259 OID 21847)
-- Name: payments_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_created_at_idx ON public.payments USING btree (created_at DESC);


--
-- TOC entry 5268 (class 1259 OID 21848)
-- Name: payments_gateway_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_gateway_transaction_id_idx ON public.payments USING btree (gateway_transaction_id);


--
-- TOC entry 5269 (class 1259 OID 21849)
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_order_id_idx ON public.payments USING btree (order_id);


--
-- TOC entry 5270 (class 1259 OID 21850)
-- Name: payments_payment_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_method_id_idx ON public.payments USING btree (payment_method_id);


--
-- TOC entry 5273 (class 1259 OID 21851)
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- TOC entry 5274 (class 1259 OID 21852)
-- Name: product_categories_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_category_id_idx ON public.product_categories USING btree (category_id);


--
-- TOC entry 5277 (class 1259 OID 21853)
-- Name: product_categories_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_product_id_idx ON public.product_categories USING btree (product_id);


--
-- TOC entry 5280 (class 1259 OID 21854)
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- TOC entry 5281 (class 1259 OID 21855)
-- Name: product_images_product_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_is_primary_idx ON public.product_images USING btree (product_id, is_primary);


--
-- TOC entry 5282 (class 1259 OID 21856)
-- Name: product_images_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_idx ON public.product_images USING btree (variant_id);


--
-- TOC entry 5283 (class 1259 OID 21857)
-- Name: product_images_variant_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_is_primary_idx ON public.product_images USING btree (variant_id, is_primary);


--
-- TOC entry 5284 (class 1259 OID 21858)
-- Name: product_option_values_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_is_active_idx ON public.product_option_values USING btree (is_active);


--
-- TOC entry 5291 (class 1259 OID 21859)
-- Name: product_option_values_on_products_product_id_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_product_id_option_id_idx ON public.product_option_values_on_products USING btree (product_id, option_id);


--
-- TOC entry 5292 (class 1259 OID 21860)
-- Name: product_option_values_on_products_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_value_id_idx ON public.product_option_values_on_products USING btree (value_id);


--
-- TOC entry 5285 (class 1259 OID 21861)
-- Name: product_option_values_option_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_option_id_sort_order_idx ON public.product_option_values USING btree (option_id, sort_order);


--
-- TOC entry 5286 (class 1259 OID 21862)
-- Name: product_option_values_option_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_option_values_option_id_value_key ON public.product_option_values USING btree (option_id, value);


--
-- TOC entry 5293 (class 1259 OID 21863)
-- Name: product_options_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_code_idx ON public.product_options USING btree (code);


--
-- TOC entry 5294 (class 1259 OID 21864)
-- Name: product_options_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_options_code_key ON public.product_options USING btree (code);


--
-- TOC entry 5295 (class 1259 OID 21865)
-- Name: product_options_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_is_active_idx ON public.product_options USING btree (is_active);


--
-- TOC entry 5298 (class 1259 OID 21866)
-- Name: product_options_on_products_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_option_id_idx ON public.product_options_on_products USING btree (option_id);


--
-- TOC entry 5301 (class 1259 OID 21867)
-- Name: product_options_on_products_product_id_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_product_id_position_idx ON public.product_options_on_products USING btree (product_id, "position");


--
-- TOC entry 5302 (class 1259 OID 21868)
-- Name: product_variants_is_active_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_is_active_product_id_idx ON public.product_variants USING btree (is_active, product_id);


--
-- TOC entry 5305 (class 1259 OID 21869)
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- TOC entry 5306 (class 1259 OID 21870)
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- TOC entry 5307 (class 1259 OID 21871)
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- TOC entry 5310 (class 1259 OID 21872)
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- TOC entry 5311 (class 1259 OID 21873)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5312 (class 1259 OID 21874)
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- TOC entry 5313 (class 1259 OID 21875)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 5314 (class 1259 OID 21876)
-- Name: products_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_deleted_at_idx ON public.products USING btree (status, deleted_at);


--
-- TOC entry 5315 (class 1259 OID 21877)
-- Name: products_visibility_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_visibility_status_deleted_at_idx ON public.products USING btree (visibility, status, deleted_at);


--
-- TOC entry 5316 (class 1259 OID 21878)
-- Name: promotion_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_customer_group_id_idx ON public.promotion_customer_groups USING btree (customer_group_id);


--
-- TOC entry 5319 (class 1259 OID 21879)
-- Name: promotion_customer_groups_promotion_id_customer_group_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotion_customer_groups_promotion_id_customer_group_id_key ON public.promotion_customer_groups USING btree (promotion_id, customer_group_id);


--
-- TOC entry 5320 (class 1259 OID 21880)
-- Name: promotion_customer_groups_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_idx ON public.promotion_customer_groups USING btree (promotion_id);


--
-- TOC entry 5321 (class 1259 OID 21881)
-- Name: promotion_customer_groups_promotion_id_is_excluded_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_is_excluded_idx ON public.promotion_customer_groups USING btree (promotion_id, is_excluded);


--
-- TOC entry 5322 (class 1259 OID 21882)
-- Name: promotion_logs_cart_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_cart_id_idx ON public.promotion_logs USING btree (cart_id);


--
-- TOC entry 5323 (class 1259 OID 21883)
-- Name: promotion_logs_checkout_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_checkout_id_idx ON public.promotion_logs USING btree (checkout_id);


--
-- TOC entry 5324 (class 1259 OID 21884)
-- Name: promotion_logs_coupon_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_coupon_code_idx ON public.promotion_logs USING btree (coupon_code);


--
-- TOC entry 5325 (class 1259 OID 21885)
-- Name: promotion_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_created_at_idx ON public.promotion_logs USING btree (created_at DESC);


--
-- TOC entry 5326 (class 1259 OID 21886)
-- Name: promotion_logs_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_customer_id_idx ON public.promotion_logs USING btree (customer_id);


--
-- TOC entry 5327 (class 1259 OID 21887)
-- Name: promotion_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_order_id_idx ON public.promotion_logs USING btree (order_id);


--
-- TOC entry 5330 (class 1259 OID 21888)
-- Name: promotion_logs_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_promotion_id_idx ON public.promotion_logs USING btree (promotion_id);


--
-- TOC entry 5331 (class 1259 OID 21889)
-- Name: promotion_products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_category_id_idx ON public.promotion_products USING btree (category_id);


--
-- TOC entry 5334 (class 1259 OID 21890)
-- Name: promotion_products_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_product_id_idx ON public.promotion_products USING btree (product_id);


--
-- TOC entry 5335 (class 1259 OID 21891)
-- Name: promotion_products_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_promotion_id_idx ON public.promotion_products USING btree (promotion_id);


--
-- TOC entry 5336 (class 1259 OID 21892)
-- Name: promotion_products_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_variant_id_idx ON public.promotion_products USING btree (variant_id);


--
-- TOC entry 5337 (class 1259 OID 21893)
-- Name: promotions_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_code_idx ON public.promotions USING btree (code);


--
-- TOC entry 5338 (class 1259 OID 21894)
-- Name: promotions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotions_code_key ON public.promotions USING btree (code);


--
-- TOC entry 5341 (class 1259 OID 21895)
-- Name: promotions_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_start_date_end_date_idx ON public.promotions USING btree (start_date, end_date);


--
-- TOC entry 5342 (class 1259 OID 21896)
-- Name: promotions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_idx ON public.promotions USING btree (status);


--
-- TOC entry 5343 (class 1259 OID 21897)
-- Name: promotions_status_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_start_date_end_date_idx ON public.promotions USING btree (status, start_date, end_date);


--
-- TOC entry 5344 (class 1259 OID 21898)
-- Name: shipping_method_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_customer_group_id_idx ON public.shipping_method_customer_groups USING btree (customer_group_id);


--
-- TOC entry 5347 (class 1259 OID 21899)
-- Name: shipping_method_customer_groups_shipping_method_id_customer_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX shipping_method_customer_groups_shipping_method_id_customer_key ON public.shipping_method_customer_groups USING btree (shipping_method_id, customer_group_id);


--
-- TOC entry 5348 (class 1259 OID 21900)
-- Name: shipping_method_customer_groups_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_shipping_method_id_idx ON public.shipping_method_customer_groups USING btree (shipping_method_id);


--
-- TOC entry 5349 (class 1259 OID 21901)
-- Name: shipping_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_code_idx ON public.shipping_methods USING btree (code);


--
-- TOC entry 5350 (class 1259 OID 21902)
-- Name: shipping_methods_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_is_active_priority_idx ON public.shipping_methods USING btree (is_active, priority);


--
-- TOC entry 5353 (class 1259 OID 21903)
-- Name: shipping_methods_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_type_idx ON public.shipping_methods USING btree (type);


--
-- TOC entry 5354 (class 1259 OID 21904)
-- Name: shipping_methods_zone_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_zone_id_idx ON public.shipping_methods USING btree (zone_id);


--
-- TOC entry 5426 (class 1259 OID 22553)
-- Name: shipping_rates_is_cod_available_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_rates_is_cod_available_idx ON public.shipping_rates USING btree (is_cod_available);


--
-- TOC entry 5429 (class 1259 OID 22551)
-- Name: shipping_rates_province_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_rates_province_city_idx ON public.shipping_rates USING btree (province, city);


--
-- TOC entry 5430 (class 1259 OID 22552)
-- Name: shipping_rates_province_min_weight_kg_max_weight_kg_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_rates_province_min_weight_kg_max_weight_kg_idx ON public.shipping_rates USING btree (province, min_weight_kg, max_weight_kg);


--
-- TOC entry 5355 (class 1259 OID 21905)
-- Name: shipping_zones_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_is_active_priority_idx ON public.shipping_zones USING btree (is_active, priority);


--
-- TOC entry 5358 (class 1259 OID 21906)
-- Name: shipping_zones_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_priority_idx ON public.shipping_zones USING btree (priority);


--
-- TOC entry 5423 (class 1259 OID 22525)
-- Name: social_links_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_links_is_active_sort_order_idx ON public.social_links USING btree (is_active, sort_order);


--
-- TOC entry 5359 (class 1259 OID 21907)
-- Name: storefront_filter_options_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_options_filter_id_is_active_sort_order_idx ON public.storefront_filter_options USING btree (filter_id, is_active, sort_order);


--
-- TOC entry 5360 (class 1259 OID 21908)
-- Name: storefront_filter_options_filter_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_options_filter_id_value_key ON public.storefront_filter_options USING btree (filter_id, value);


--
-- TOC entry 5363 (class 1259 OID 21909)
-- Name: storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, is_active, sort_order);


--
-- TOC entry 5364 (class 1259 OID 21910)
-- Name: storefront_filter_tree_nodes_filter_id_nav_link_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_tree_nodes_filter_id_nav_link_id_key ON public.storefront_filter_tree_nodes USING btree (filter_id, nav_link_id);


--
-- TOC entry 5365 (class 1259 OID 21911)
-- Name: storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, parent_id, sort_order);


--
-- TOC entry 5368 (class 1259 OID 21912)
-- Name: storefront_filters_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filters_code_key ON public.storefront_filters USING btree (code);


--
-- TOC entry 5369 (class 1259 OID 21913)
-- Name: storefront_filters_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filters_is_active_sort_order_idx ON public.storefront_filters USING btree (is_active, sort_order);


--
-- TOC entry 5372 (class 1259 OID 21914)
-- Name: storefront_nav_links_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_is_active_sort_order_idx ON public.storefront_nav_links USING btree (is_active, sort_order);


--
-- TOC entry 5375 (class 1259 OID 21915)
-- Name: storefront_nav_links_zone_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_zone_parent_id_sort_order_idx ON public.storefront_nav_links USING btree (zone, parent_id, sort_order);


--
-- TOC entry 5376 (class 1259 OID 21916)
-- Name: subscribers_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscribers_created_at_idx ON public.subscribers USING btree (created_at DESC);


--
-- TOC entry 5377 (class 1259 OID 21917)
-- Name: subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers USING btree (email);


--
-- TOC entry 5380 (class 1259 OID 21918)
-- Name: tax_classes_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tax_classes_code_idx ON public.tax_classes USING btree (code);


--
-- TOC entry 5381 (class 1259 OID 21919)
-- Name: tax_classes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tax_classes_code_key ON public.tax_classes USING btree (code);


--
-- TOC entry 5384 (class 1259 OID 21920)
-- Name: taxes_country_region_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_idx ON public.taxes USING btree (country, region);


--
-- TOC entry 5385 (class 1259 OID 21921)
-- Name: taxes_country_region_tax_class_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_tax_class_id_is_active_idx ON public.taxes USING btree (country, region, tax_class_id, is_active);


--
-- TOC entry 5386 (class 1259 OID 21922)
-- Name: taxes_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_is_active_idx ON public.taxes USING btree (is_active);


--
-- TOC entry 5389 (class 1259 OID 21923)
-- Name: taxes_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_start_date_end_date_idx ON public.taxes USING btree (start_date, end_date);


--
-- TOC entry 5390 (class 1259 OID 21924)
-- Name: taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_tax_class_id_idx ON public.taxes USING btree (tax_class_id);


--
-- TOC entry 5391 (class 1259 OID 21925)
-- Name: variant_option_values_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_option_id_idx ON public.variant_option_values USING btree (option_id);


--
-- TOC entry 5394 (class 1259 OID 21926)
-- Name: variant_option_values_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_value_id_idx ON public.variant_option_values USING btree (value_id);


--
-- TOC entry 5395 (class 1259 OID 21927)
-- Name: variant_option_values_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_variant_id_idx ON public.variant_option_values USING btree (variant_id);


--
-- TOC entry 5418 (class 1259 OID 22490)
-- Name: wishlist_items_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wishlist_items_customer_id_idx ON public.wishlist_items USING btree (customer_id);


--
-- TOC entry 5419 (class 1259 OID 22489)
-- Name: wishlist_items_customer_id_product_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX wishlist_items_customer_id_product_id_key ON public.wishlist_items USING btree (customer_id, product_id);


--
-- TOC entry 5422 (class 1259 OID 22491)
-- Name: wishlist_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wishlist_items_product_id_idx ON public.wishlist_items USING btree (product_id);


--
-- TOC entry 5441 (class 2606 OID 21928)
-- Name: admin_role_permissions admin_role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5442 (class 2606 OID 21933)
-- Name: admin_role_permissions admin_role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5443 (class 2606 OID 21938)
-- Name: admin_user_roles admin_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5444 (class 2606 OID 21943)
-- Name: admin_user_roles admin_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5488 (class 2606 OID 22385)
-- Name: bundle_deal_items bundle_deal_items_bundle_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_deal_items
    ADD CONSTRAINT bundle_deal_items_bundle_deal_id_fkey FOREIGN KEY (bundle_deal_id) REFERENCES public.bundle_deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5489 (class 2606 OID 22390)
-- Name: bundle_deal_items bundle_deal_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_deal_items
    ADD CONSTRAINT bundle_deal_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5490 (class 2606 OID 22395)
-- Name: bundle_deal_items bundle_deal_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_deal_items
    ADD CONSTRAINT bundle_deal_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5445 (class 2606 OID 21948)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5446 (class 2606 OID 21953)
-- Name: cms_banner_slides cms_banner_slides_slider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_slider_id_fkey FOREIGN KEY (slider_id) REFERENCES public.cms_banner_sliders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5493 (class 2606 OID 22595)
-- Name: courier_cities courier_cities_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_cities
    ADD CONSTRAINT courier_cities_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.courier_zones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5447 (class 2606 OID 21958)
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5448 (class 2606 OID 21963)
-- Name: customers customers_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5449 (class 2606 OID 21968)
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5450 (class 2606 OID 21973)
-- Name: inventory_items inventory_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5451 (class 2606 OID 21978)
-- Name: inventory_reservations inventory_reservations_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5452 (class 2606 OID 21983)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5453 (class 2606 OID 21988)
-- Name: order_shipping order_shipping_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5454 (class 2606 OID 21993)
-- Name: order_shipping order_shipping_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5455 (class 2606 OID 21998)
-- Name: order_taxes order_taxes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5456 (class 2606 OID 22003)
-- Name: order_taxes order_taxes_tax_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES public.taxes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5457 (class 2606 OID 22008)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5458 (class 2606 OID 22013)
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5459 (class 2606 OID 22018)
-- Name: product_categories product_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5460 (class 2606 OID 22023)
-- Name: product_categories product_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5461 (class 2606 OID 22028)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5462 (class 2606 OID 22033)
-- Name: product_images product_images_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5464 (class 2606 OID 22038)
-- Name: product_option_values_on_products product_option_values_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5465 (class 2606 OID 22043)
-- Name: product_option_values_on_products product_option_values_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5466 (class 2606 OID 22048)
-- Name: product_option_values_on_products product_option_values_on_products_product_id_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_option_id_fkey FOREIGN KEY (product_id, option_id) REFERENCES public.product_options_on_products(product_id, option_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5467 (class 2606 OID 22053)
-- Name: product_option_values_on_products product_option_values_on_products_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5463 (class 2606 OID 22058)
-- Name: product_option_values product_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5468 (class 2606 OID 22063)
-- Name: product_options_on_products product_options_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5469 (class 2606 OID 22068)
-- Name: product_options_on_products product_options_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5470 (class 2606 OID 22073)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5471 (class 2606 OID 22078)
-- Name: promotion_customer_groups promotion_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5472 (class 2606 OID 22083)
-- Name: promotion_customer_groups promotion_customer_groups_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5473 (class 2606 OID 22088)
-- Name: promotion_logs promotion_logs_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5474 (class 2606 OID 22093)
-- Name: promotion_products promotion_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5475 (class 2606 OID 22098)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5476 (class 2606 OID 22103)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5477 (class 2606 OID 22108)
-- Name: shipping_methods shipping_methods_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5478 (class 2606 OID 22113)
-- Name: storefront_filter_options storefront_filter_options_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5479 (class 2606 OID 22118)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5480 (class 2606 OID 22123)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_nav_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_nav_link_id_fkey FOREIGN KEY (nav_link_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5481 (class 2606 OID 22128)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_filter_tree_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5482 (class 2606 OID 22133)
-- Name: storefront_nav_links storefront_nav_links_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5483 (class 2606 OID 22138)
-- Name: storefront_nav_links storefront_nav_links_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5484 (class 2606 OID 22143)
-- Name: taxes taxes_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_tax_class_id_fkey FOREIGN KEY (tax_class_id) REFERENCES public.tax_classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5485 (class 2606 OID 22148)
-- Name: variant_option_values variant_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5486 (class 2606 OID 22153)
-- Name: variant_option_values variant_option_values_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5487 (class 2606 OID 22158)
-- Name: variant_option_values variant_option_values_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5491 (class 2606 OID 22492)
-- Name: wishlist_items wishlist_items_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5492 (class 2606 OID 22497)
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5704 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-08-21 15:29:15

--
-- PostgreSQL database dump complete
--

\unrestrict Kh8uxZEo98ovsTd6iN06Me5AoFH6un3nL38rkqEydsKkf5UxoFwx83aSe2WTClr

