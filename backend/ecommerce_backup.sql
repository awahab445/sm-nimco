--
-- PostgreSQL database dump
--

\restrict V40PtDrJPuPAur8PaA2d5NKYjG1oL4vZIZgAa0dAspCxLcJ1t2TjJ43vl06ew2b

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-15 18:17:38

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 18329)
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
-- TOC entry 250 (class 1259 OID 18879)
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
-- TOC entry 252 (class 1259 OID 18915)
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
-- TOC entry 254 (class 1259 OID 18941)
-- Name: admin_role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.admin_role_permissions OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 18926)
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
-- TOC entry 256 (class 1259 OID 18963)
-- Name: admin_user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


ALTER TABLE public.admin_user_roles OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 18948)
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
-- TOC entry 229 (class 1259 OID 18478)
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
-- TOC entry 259 (class 1259 OID 19002)
-- Name: cms_banner_sliders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_banner_sliders (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    identifier character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    autoplay_ms integer,
    slide_width_px integer,
    slide_height_px integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cms_banner_sliders OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 19017)
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
-- TOC entry 258 (class 1259 OID 18986)
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
-- TOC entry 257 (class 1259 OID 18970)
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
-- TOC entry 251 (class 1259 OID 18892)
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
-- TOC entry 248 (class 1259 OID 18846)
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
-- TOC entry 249 (class 1259 OID 18862)
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
-- TOC entry 231 (class 1259 OID 18506)
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
-- TOC entry 232 (class 1259 OID 18524)
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
-- TOC entry 234 (class 1259 OID 18572)
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
-- TOC entry 243 (class 1259 OID 18753)
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
-- TOC entry 247 (class 1259 OID 18823)
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
-- TOC entry 233 (class 1259 OID 18539)
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
-- TOC entry 235 (class 1259 OID 18601)
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
-- TOC entry 236 (class 1259 OID 18622)
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
-- TOC entry 230 (class 1259 OID 18495)
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    product_id text NOT NULL,
    category_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18462)
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
-- TOC entry 224 (class 1259 OID 18412)
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
-- TOC entry 226 (class 1259 OID 18442)
-- Name: product_option_values_on_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option_values_on_products (
    product_id text NOT NULL,
    option_id text NOT NULL,
    value_id text NOT NULL
);


ALTER TABLE public.product_option_values_on_products OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18397)
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
-- TOC entry 225 (class 1259 OID 18429)
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
-- TOC entry 222 (class 1259 OID 18377)
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
-- TOC entry 221 (class 1259 OID 18355)
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
-- TOC entry 239 (class 1259 OID 18680)
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
-- TOC entry 240 (class 1259 OID 18692)
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
-- TOC entry 238 (class 1259 OID 18671)
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
-- TOC entry 237 (class 1259 OID 18641)
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
-- TOC entry 244 (class 1259 OID 18773)
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
-- TOC entry 242 (class 1259 OID 18729)
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
-- TOC entry 241 (class 1259 OID 18709)
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
-- TOC entry 263 (class 1259 OID 19065)
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
-- TOC entry 262 (class 1259 OID 19051)
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
-- TOC entry 261 (class 1259 OID 19035)
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
-- TOC entry 264 (class 1259 OID 19082)
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
    zone character varying(16) DEFAULT 'header'::character varying NOT NULL,
    parent_id uuid,
    category_id text,
    open_mega_menu boolean DEFAULT false NOT NULL,
    banner_image_url character varying(512),
    banner_href character varying(512),
    banner_alt character varying(256),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.storefront_nav_links OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18343)
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
-- TOC entry 245 (class 1259 OID 18788)
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
-- TOC entry 246 (class 1259 OID 18803)
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
-- TOC entry 227 (class 1259 OID 18452)
-- Name: variant_option_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variant_option_values (
    variant_id text NOT NULL,
    option_id text NOT NULL,
    value_id text NOT NULL
);


ALTER TABLE public.variant_option_values OWNER TO postgres;

--
-- TOC entry 5490 (class 0 OID 18329)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4bee5d4c-6bb1-48ad-be1b-3af8cb822d19	11a0ced84fb4fcf231e3ce51d31b7e7d24a122fd3981136527fc66e8d188a1f8	2026-06-15 16:31:47.988191+05	20260212120000_newsletter_subscribers	\N	\N	2026-06-15 16:31:47.970336+05	1
\.


--
-- TOC entry 5521 (class 0 OID 18879)
-- Dependencies: 250
-- Data for Name: account_creation_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_creation_tokens (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5523 (class 0 OID 18915)
-- Dependencies: 252
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions (id, key, description, created_at) FROM stdin;
00cc5cb2-c2aa-4668-b1e9-44f7a458e3b5	orders.read	Read orders	2026-06-15 11:33:44.874
0b072809-98bf-4129-a634-db990012331d	orders.update	Update orders, status, fulfillment	2026-06-15 11:33:44.875
b5d6b4a0-4174-4b61-b0c3-63d586fd8b42	orders.delete	Delete orders	2026-06-15 11:33:44.876
dba27e9e-2710-4285-ac47-bc05762d91ed	customers.create	Create customers	2026-06-15 11:33:44.877
c1ebeb0d-5e31-48af-a8e8-83387d5879c5	customers.read	Read customers	2026-06-15 11:33:44.879
61601ed4-b780-4b91-bb3e-c7234a4899d8	customers.update	Update customers	2026-06-15 11:33:44.88
16bc3c14-b281-4cce-8ab5-8e77350efdd0	customers.delete	Delete customers	2026-06-15 11:33:44.881
007822ae-cd09-495f-be82-07f02bd6202d	products.manage	Manage products, categories, and product options (implies all products.* actions)	2026-06-15 11:33:44.883
cf5fa5d4-e2d9-40d5-9a46-b23737533b02	inventory.read	Read inventory	2026-06-15 11:33:44.884
79e39a93-5017-48fc-a3ee-216c8ecab964	inventory.manage	Manage inventory and stock	2026-06-15 11:33:44.885
cb2c6c00-35e3-47bd-b6ef-759df8100083	orders.manage	Manage orders (implies all orders.* actions)	2026-06-15 11:33:44.886
463ceb62-b5e4-4a73-810a-e0f1ae19c276	customers.manage	Manage customers and groups (implies all customers.* actions)	2026-06-15 11:33:44.887
5c7f0c43-f754-40c7-b023-92ff9c041564	promotions.manage	Manage promotions	2026-06-15 11:33:44.888
a86d6499-c1d9-4ce6-a746-0ce8a19bed7e	shipping.manage	Manage shipping zones and methods	2026-06-15 11:33:44.89
d2f65979-3b64-4500-a581-38420765f493	tax.manage	Manage tax classes and rates	2026-06-15 11:33:44.891
f7455787-2afc-4d1d-a410-5818b7111536	payments.manage	Manage payment configuration	2026-06-15 11:33:44.892
e76bf2a6-ac95-4d06-b3d7-1f7f0cb56a28	cms.manage	Manage CMS pages, blocks, and sliders	2026-06-15 11:33:44.893
04e880a5-57b1-45c2-84bb-48cf620110ab	subscriptions.manage	View storefront email subscriptions (subscriber list)	2026-06-15 11:33:44.895
7b4402ec-8574-4ce4-9bf4-ab1d586caf0f	reports.read	Access reports and exports	2026-06-15 11:33:44.896
45dd1bfd-0a1c-4ca1-914a-5ef34326c2ca	settings.manage	Platform settings	2026-06-15 11:33:44.897
40bb1bcb-7783-4f4a-8edb-6fd89779d09b	admin.access.full	Full administrative access (implies all permissions).	2026-06-15 11:33:44.852
995c348f-fefa-4bee-819b-7ea29eab9e95	admin.users.create	Create staff admin users	2026-06-15 11:33:44.857
e127ee8b-dc82-418a-ab5c-56aaa15642f2	admin.users.read	View admin users	2026-06-15 11:33:44.859
b6931a25-ebd3-4037-8979-ae8018792036	admin.users.update	Update admin users	2026-06-15 11:33:44.86
c7afb6e4-fd96-4674-b6b5-f0fd1a437610	admin.users.delete	Deactivate or remove admin users	2026-06-15 11:33:44.862
9a20b1c7-eebc-4d8e-97cc-c4b181b67098	admin.roles.read	View roles and permission assignments	2026-06-15 11:33:44.864
576aa7a7-ca41-41ae-873a-cb6186fc4fd8	admin.roles.manage	Create or update roles and permissions	2026-06-15 11:33:44.865
7e848b22-9240-46f0-be3a-cad823b96e15	products.create	Create products	2026-06-15 11:33:44.867
6c8feeb6-474e-44b5-8bd3-c5162f59d0b6	products.read	Read products	2026-06-15 11:33:44.868
3ea61c3c-03f4-40af-be15-366908384814	products.update	Update products and their sub-resources (variants, images, categories)	2026-06-15 11:33:44.869
135a50b1-e796-4b2e-bae7-4e02f4baecfd	products.delete	Delete products	2026-06-15 11:33:44.871
b40564c0-d695-4802-9127-074529f683fb	orders.create	Create orders (admin-side)	2026-06-15 11:33:44.872
\.


--
-- TOC entry 5525 (class 0 OID 18941)
-- Dependencies: 254
-- Data for Name: admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_role_permissions (role_id, permission_id) FROM stdin;
dfd57df9-1f27-4dd1-851b-29801b33cbd0	00cc5cb2-c2aa-4668-b1e9-44f7a458e3b5
dfd57df9-1f27-4dd1-851b-29801b33cbd0	0b072809-98bf-4129-a634-db990012331d
dfd57df9-1f27-4dd1-851b-29801b33cbd0	b5d6b4a0-4174-4b61-b0c3-63d586fd8b42
dfd57df9-1f27-4dd1-851b-29801b33cbd0	dba27e9e-2710-4285-ac47-bc05762d91ed
dfd57df9-1f27-4dd1-851b-29801b33cbd0	c1ebeb0d-5e31-48af-a8e8-83387d5879c5
dfd57df9-1f27-4dd1-851b-29801b33cbd0	61601ed4-b780-4b91-bb3e-c7234a4899d8
dfd57df9-1f27-4dd1-851b-29801b33cbd0	16bc3c14-b281-4cce-8ab5-8e77350efdd0
dfd57df9-1f27-4dd1-851b-29801b33cbd0	007822ae-cd09-495f-be82-07f02bd6202d
dfd57df9-1f27-4dd1-851b-29801b33cbd0	cf5fa5d4-e2d9-40d5-9a46-b23737533b02
dfd57df9-1f27-4dd1-851b-29801b33cbd0	79e39a93-5017-48fc-a3ee-216c8ecab964
dfd57df9-1f27-4dd1-851b-29801b33cbd0	cb2c6c00-35e3-47bd-b6ef-759df8100083
dfd57df9-1f27-4dd1-851b-29801b33cbd0	463ceb62-b5e4-4a73-810a-e0f1ae19c276
dfd57df9-1f27-4dd1-851b-29801b33cbd0	5c7f0c43-f754-40c7-b023-92ff9c041564
dfd57df9-1f27-4dd1-851b-29801b33cbd0	a86d6499-c1d9-4ce6-a746-0ce8a19bed7e
dfd57df9-1f27-4dd1-851b-29801b33cbd0	d2f65979-3b64-4500-a581-38420765f493
dfd57df9-1f27-4dd1-851b-29801b33cbd0	f7455787-2afc-4d1d-a410-5818b7111536
dfd57df9-1f27-4dd1-851b-29801b33cbd0	e76bf2a6-ac95-4d06-b3d7-1f7f0cb56a28
dfd57df9-1f27-4dd1-851b-29801b33cbd0	04e880a5-57b1-45c2-84bb-48cf620110ab
dfd57df9-1f27-4dd1-851b-29801b33cbd0	7b4402ec-8574-4ce4-9bf4-ab1d586caf0f
dfd57df9-1f27-4dd1-851b-29801b33cbd0	45dd1bfd-0a1c-4ca1-914a-5ef34326c2ca
dfd57df9-1f27-4dd1-851b-29801b33cbd0	40bb1bcb-7783-4f4a-8edb-6fd89779d09b
dfd57df9-1f27-4dd1-851b-29801b33cbd0	995c348f-fefa-4bee-819b-7ea29eab9e95
dfd57df9-1f27-4dd1-851b-29801b33cbd0	e127ee8b-dc82-418a-ab5c-56aaa15642f2
dfd57df9-1f27-4dd1-851b-29801b33cbd0	b6931a25-ebd3-4037-8979-ae8018792036
dfd57df9-1f27-4dd1-851b-29801b33cbd0	c7afb6e4-fd96-4674-b6b5-f0fd1a437610
dfd57df9-1f27-4dd1-851b-29801b33cbd0	9a20b1c7-eebc-4d8e-97cc-c4b181b67098
dfd57df9-1f27-4dd1-851b-29801b33cbd0	576aa7a7-ca41-41ae-873a-cb6186fc4fd8
dfd57df9-1f27-4dd1-851b-29801b33cbd0	7e848b22-9240-46f0-be3a-cad823b96e15
dfd57df9-1f27-4dd1-851b-29801b33cbd0	6c8feeb6-474e-44b5-8bd3-c5162f59d0b6
dfd57df9-1f27-4dd1-851b-29801b33cbd0	3ea61c3c-03f4-40af-be15-366908384814
dfd57df9-1f27-4dd1-851b-29801b33cbd0	135a50b1-e796-4b2e-bae7-4e02f4baecfd
dfd57df9-1f27-4dd1-851b-29801b33cbd0	b40564c0-d695-4802-9127-074529f683fb
97226822-9b0f-4c86-b630-e8f98864b92f	00cc5cb2-c2aa-4668-b1e9-44f7a458e3b5
97226822-9b0f-4c86-b630-e8f98864b92f	0b072809-98bf-4129-a634-db990012331d
97226822-9b0f-4c86-b630-e8f98864b92f	b5d6b4a0-4174-4b61-b0c3-63d586fd8b42
97226822-9b0f-4c86-b630-e8f98864b92f	dba27e9e-2710-4285-ac47-bc05762d91ed
97226822-9b0f-4c86-b630-e8f98864b92f	c1ebeb0d-5e31-48af-a8e8-83387d5879c5
97226822-9b0f-4c86-b630-e8f98864b92f	61601ed4-b780-4b91-bb3e-c7234a4899d8
97226822-9b0f-4c86-b630-e8f98864b92f	16bc3c14-b281-4cce-8ab5-8e77350efdd0
97226822-9b0f-4c86-b630-e8f98864b92f	007822ae-cd09-495f-be82-07f02bd6202d
97226822-9b0f-4c86-b630-e8f98864b92f	cf5fa5d4-e2d9-40d5-9a46-b23737533b02
97226822-9b0f-4c86-b630-e8f98864b92f	79e39a93-5017-48fc-a3ee-216c8ecab964
97226822-9b0f-4c86-b630-e8f98864b92f	cb2c6c00-35e3-47bd-b6ef-759df8100083
97226822-9b0f-4c86-b630-e8f98864b92f	463ceb62-b5e4-4a73-810a-e0f1ae19c276
97226822-9b0f-4c86-b630-e8f98864b92f	5c7f0c43-f754-40c7-b023-92ff9c041564
97226822-9b0f-4c86-b630-e8f98864b92f	a86d6499-c1d9-4ce6-a746-0ce8a19bed7e
97226822-9b0f-4c86-b630-e8f98864b92f	d2f65979-3b64-4500-a581-38420765f493
97226822-9b0f-4c86-b630-e8f98864b92f	f7455787-2afc-4d1d-a410-5818b7111536
97226822-9b0f-4c86-b630-e8f98864b92f	e76bf2a6-ac95-4d06-b3d7-1f7f0cb56a28
97226822-9b0f-4c86-b630-e8f98864b92f	04e880a5-57b1-45c2-84bb-48cf620110ab
97226822-9b0f-4c86-b630-e8f98864b92f	7b4402ec-8574-4ce4-9bf4-ab1d586caf0f
97226822-9b0f-4c86-b630-e8f98864b92f	e127ee8b-dc82-418a-ab5c-56aaa15642f2
97226822-9b0f-4c86-b630-e8f98864b92f	9a20b1c7-eebc-4d8e-97cc-c4b181b67098
97226822-9b0f-4c86-b630-e8f98864b92f	7e848b22-9240-46f0-be3a-cad823b96e15
97226822-9b0f-4c86-b630-e8f98864b92f	6c8feeb6-474e-44b5-8bd3-c5162f59d0b6
97226822-9b0f-4c86-b630-e8f98864b92f	3ea61c3c-03f4-40af-be15-366908384814
97226822-9b0f-4c86-b630-e8f98864b92f	135a50b1-e796-4b2e-bae7-4e02f4baecfd
97226822-9b0f-4c86-b630-e8f98864b92f	b40564c0-d695-4802-9127-074529f683fb
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	00cc5cb2-c2aa-4668-b1e9-44f7a458e3b5
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	c1ebeb0d-5e31-48af-a8e8-83387d5879c5
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	cf5fa5d4-e2d9-40d5-9a46-b23737533b02
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	7b4402ec-8574-4ce4-9bf4-ab1d586caf0f
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	9a20b1c7-eebc-4d8e-97cc-c4b181b67098
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	6c8feeb6-474e-44b5-8bd3-c5162f59d0b6
\.


--
-- TOC entry 5524 (class 0 OID 18926)
-- Dependencies: 253
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_roles (id, slug, name, description, is_system, created_at, updated_at) FROM stdin;
dfd57df9-1f27-4dd1-851b-29801b33cbd0	super-admin	Super Admin	Full platform access. Assign sparingly.	t	2026-06-15 11:33:44.899	2026-06-15 12:55:34.12
97226822-9b0f-4c86-b630-e8f98864b92f	manager	Operations Manager	Day-to-day commerce operations without user/role administration.	t	2026-06-15 11:33:44.901	2026-06-15 12:55:34.122
9b7b127c-6f1e-4637-9e26-45ea1a159c9f	support	Support	Read-heavy access for customer service.	t	2026-06-15 11:33:44.903	2026-06-15 12:55:34.124
\.


--
-- TOC entry 5527 (class 0 OID 18963)
-- Dependencies: 256
-- Data for Name: admin_user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_user_roles (user_id, role_id) FROM stdin;
\.


--
-- TOC entry 5526 (class 0 OID 18948)
-- Dependencies: 255
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, password_hash, first_name, last_name, is_active, last_login_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5500 (class 0 OID 18478)
-- Dependencies: 229
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, parent_id, "position", is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5530 (class 0 OID 19002)
-- Dependencies: 259
-- Data for Name: cms_banner_sliders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_sliders (id, name, identifier, is_active, autoplay_ms, slide_width_px, slide_height_px, created_at, updated_at) FROM stdin;
f9d65f49-463f-4418-80b2-c258ed1d2209	Home Hero Slider	home-hero	t	5000	1920	800	2026-06-15 11:33:58.676	2026-06-15 12:52:28.04
\.


--
-- TOC entry 5531 (class 0 OID 19017)
-- Dependencies: 260
-- Data for Name: cms_banner_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_banner_slides (id, slider_id, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active, created_at, updated_at) FROM stdin;
8ca981dc-f758-476a-8b17-397933e19623	f9d65f49-463f-4418-80b2-c258ed1d2209	Shop smarter with confidence	Curated essentials at fair prices.	/themes/mehfil-shereen/banner1.jpeg	Shop now	/products	0	t	2026-06-15 12:52:28.054	2026-06-15 12:52:28.054
9f145c79-b91b-400c-9799-39da77400ac8	f9d65f49-463f-4418-80b2-c258ed1d2209	Track your orders anytime	Real-time updates from checkout to delivery.	/themes/mehfil-shereen/banner2.jpeg	Track order	/track-order	1	t	2026-06-15 12:52:28.054	2026-06-15 12:52:28.054
\.


--
-- TOC entry 5529 (class 0 OID 18986)
-- Dependencies: 258
-- Data for Name: cms_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_blocks (id, name, identifier, description, content_html, content_json, is_active, created_at, updated_at) FROM stdin;
5c79a65b-6cab-47b3-8d80-33b2b5d25ded	Home inline teaser	home-inline-teaser	Example block embedded in homepage layout by identifier	<div class="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"><h2 class="text-lg font-semibold text-foreground">Managed as its own block</h2><p class="mt-2 text-sm text-muted-foreground">This copy lives in the <strong>home-inline-teaser</strong> CMS block. The home layout references it by identifier so you can edit it separately from the layout JSON.</p></div>	{}	t	2026-06-15 11:33:58.67	2026-06-15 12:52:28.033
1674a825-08b2-4862-9b26-3cb2c434cf69	Home Page Layout	home-page-layout	Structured sections consumed by storefront homepage	<p>Home page layout JSON block.</p>	{"sections": [{"id": "hero-main", "type": "hero_slider", "slides": [{"id": "hero-1", "title": "Welcome to our store", "ctaHref": "/products", "ctaLabel": "Shop now", "imageUrl": "/themes/mehfil-shereen/banner1.jpeg", "subtitle": "Discover great products and fast delivery"}, {"id": "hero-2", "title": "New arrivals every week", "ctaHref": "/products", "ctaLabel": "Browse products", "imageUrl": "/themes/mehfil-shereen/banner2.jpeg", "subtitle": "Fresh picks and curated collections"}], "autoplayMs": 5000}, {"id": "promo-mid", "tone": "primary", "type": "promo_banner", "title": "Members save more", "ctaHref": "/register", "ctaLabel": "Create account", "subtitle": "Create your account for exclusive offers."}, {"id": "inline-teaser", "type": "cms_block_ref", "blockIdentifier": "home-inline-teaser"}, {"id": "shelf-featured", "type": "product_shelf", "title": "Featured picks", "source": {"kind": "latest", "limit": 8}, "subtitle": "Popular right now", "viewAllHref": "/products"}, {"id": "subscription", "type": "subscription_cta", "title": "Stay in the loop", "subtitle": "Get product drops and offers by email."}]}	t	2026-06-15 11:33:58.674	2026-06-15 12:52:28.036
\.


--
-- TOC entry 5528 (class 0 OID 18970)
-- Dependencies: 257
-- Data for Name: cms_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_pages (id, title, slug, status, excerpt, meta_title, meta_description, content_html, content_json, published_at, created_at, updated_at) FROM stdin;
a0a93c96-0c3a-4528-89f6-72f52bb839e4	About Us	about-us	published	Learn more about our mission and team.	About Us	About our ecommerce store and what we stand for.	<h1>About Us</h1><p>We are building a modern ecommerce experience with trusted products and reliable delivery.</p><p>Our mission is simple: quality, transparency, and customer-first service.</p>	{}	2026-06-15 12:52:28.024	2026-06-15 11:33:58.664	2026-06-15 12:52:28.029
\.


--
-- TOC entry 5522 (class 0 OID 18892)
-- Dependencies: 251
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_addresses (id, customer_id, label, first_name, last_name, company, address_line1, address_line2, city, state, postal_code, country, phone, is_default_billing, is_default_shipping, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5519 (class 0 OID 18846)
-- Dependencies: 248
-- Data for Name: customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_groups (id, name, description, is_default, tax_class_id, discount_percent, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5520 (class 0 OID 18862)
-- Dependencies: 249
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, email, password_hash, first_name, last_name, phone, is_guest, customer_group_id, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5502 (class 0 OID 18506)
-- Dependencies: 231
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, product_id, variant_id, warehouse_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, updated_at) FROM stdin;
\.


--
-- TOC entry 5503 (class 0 OID 18524)
-- Dependencies: 232
-- Data for Name: inventory_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_reservations (id, inventory_item_id, reference_type, reference_id, quantity, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5505 (class 0 OID 18572)
-- Dependencies: 234
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, variant_id, sku, name, attributes, quantity, unit_price, discount_amount, tax_amount, row_total, quantity_fulfilled, quantity_refunded, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 5514 (class 0 OID 18753)
-- Dependencies: 243
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping (id, order_id, shipping_method_id, cost, currency, status, tracking_number, tracking_url, courier_code, courier_name, shipped_at, delivered_at, cancelled_at, shipping_address, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5518 (class 0 OID 18823)
-- Dependencies: 247
-- Data for Name: order_taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_taxes (id, order_id, tax_id, tax_class_id, tax_class_code, tax_class_name, country, region, rate, is_inclusive, taxable_amount, tax_amount, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5504 (class 0 OID 18539)
-- Dependencies: 233
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, customer_id, customer_group_id, status, payment_status, fulfillment_status, customer_email, customer_name, billing_address, shipping_address, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, applied_price_rules, ip_address, user_agent, notes, metadata, created_at, updated_at, cancelled_at, completed_at) FROM stdin;
\.


--
-- TOC entry 5506 (class 0 OID 18601)
-- Dependencies: 235
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, provider, flow_type, is_active, config, metadata, created_at, updated_at) FROM stdin;
2ea164a1-8abe-43d6-8abb-7ee53eb99da4	cod	Cash on Delivery	cod	OFFLINE	t	{}	{}	2026-06-15 11:33:58.546	2026-06-15 12:52:27.889
\.


--
-- TOC entry 5507 (class 0 OID 18622)
-- Dependencies: 236
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, payment_method_id, status, flow_type, amount, currency, gateway_transaction_id, client_secret, redirect_url, gateway_response, captured_at, failed_at, refunded_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5501 (class 0 OID 18495)
-- Dependencies: 230
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (product_id, category_id, "position") FROM stdin;
\.


--
-- TOC entry 5499 (class 0 OID 18462)
-- Dependencies: 228
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, variant_id, url, alt_text, "position", is_primary, created_at) FROM stdin;
\.


--
-- TOC entry 5495 (class 0 OID 18412)
-- Dependencies: 224
-- Data for Name: product_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values (id, option_id, value, code, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5497 (class 0 OID 18442)
-- Dependencies: 226
-- Data for Name: product_option_values_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_values_on_products (product_id, option_id, value_id) FROM stdin;
\.


--
-- TOC entry 5494 (class 0 OID 18397)
-- Dependencies: 223
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options (id, name, code, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5496 (class 0 OID 18429)
-- Dependencies: 225
-- Data for Name: product_options_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options_on_products (product_id, option_id, is_required, "position") FROM stdin;
\.


--
-- TOC entry 5493 (class 0 OID 18377)
-- Dependencies: 222
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, sku, name, price, cost, weight, attributes, "position", is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5492 (class 0 OID 18355)
-- Dependencies: 221
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, slug, type, description, short_description, base_price, cost, weight, status, visibility, tax_class_id, attributes, meta_data, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5510 (class 0 OID 18680)
-- Dependencies: 239
-- Data for Name: promotion_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_customer_groups (id, promotion_id, customer_group_id, is_excluded) FROM stdin;
\.


--
-- TOC entry 5511 (class 0 OID 18692)
-- Dependencies: 240
-- Data for Name: promotion_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_logs (id, promotion_id, cart_id, checkout_id, order_id, customer_id, coupon_code, discount_amount, subtotal_before, subtotal_after, status, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 5509 (class 0 OID 18671)
-- Dependencies: 238
-- Data for Name: promotion_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_products (id, promotion_id, product_id, variant_id, category_id) FROM stdin;
\.


--
-- TOC entry 5508 (class 0 OID 18641)
-- Dependencies: 237
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, code, name, description, type, status, discount_value, discount_type, scope, is_stackable, is_exclusive, applies_to_all_groups, conditions, usage_limit, usage_limit_per_user, current_usage, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5515 (class 0 OID 18773)
-- Dependencies: 244
-- Data for Name: shipping_method_customer_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_method_customer_groups (id, shipping_method_id, customer_group_id, discount_percent, fixed_cost, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5513 (class 0 OID 18729)
-- Dependencies: 242
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_methods (id, zone_id, code, name, description, type, config, min_order_amount, max_order_amount, min_weight, max_weight, priority, is_active, courier_config, metadata, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000001	standard	Standard Shipping	Standard delivery	flat_rate	{"cost": 99}	\N	\N	\N	\N	0	t	{}	{}	2026-06-15 11:33:58.538	2026-06-15 12:52:27.877
\.


--
-- TOC entry 5512 (class 0 OID 18709)
-- Dependencies: 241
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_zones (id, name, description, coverage, priority, is_active, metadata, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	Default	Default zone for all addresses	{}	0	t	{}	2026-06-15 11:33:58.521	2026-06-15 11:33:58.521
\.


--
-- TOC entry 5534 (class 0 OID 19065)
-- Dependencies: 263
-- Data for Name: storefront_filter_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_options (id, filter_id, value, label, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5533 (class 0 OID 19051)
-- Dependencies: 262
-- Data for Name: storefront_filter_tree_nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filter_tree_nodes (id, filter_id, parent_id, nav_link_id, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5532 (class 0 OID 19035)
-- Dependencies: 261
-- Data for Name: storefront_filters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_filters (id, code, name, kind, sort_order, is_active, created_at, updated_at) FROM stdin;
08ed08f5-7ac7-4626-824f-97c8756e9896	category	Category	CATEGORY	0	t	2026-06-15 11:33:58.645	2026-06-15 11:33:58.645
8aa1a209-8869-4df7-ba02-acd6496ae334	price	Price	PRICE	1	t	2026-06-15 11:33:58.65	2026-06-15 11:33:58.65
863e8b72-e2ce-4a74-866d-9b0c96dd5cee	brand	Brand	ATTRIBUTE	2	t	2026-06-15 11:33:58.654	2026-06-15 11:33:58.654
6f202b5d-3919-411a-a6da-f1fbeb09ced1	size	Size	ATTRIBUTE	3	t	2026-06-15 11:33:58.657	2026-06-15 11:33:58.657
\.


--
-- TOC entry 5535 (class 0 OID 19082)
-- Dependencies: 264
-- Data for Name: storefront_nav_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storefront_nav_links (id, label, secondary_label, href, sort_order, is_active, kind, zone, parent_id, category_id, open_mega_menu, banner_image_url, banner_href, banner_alt, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-00000000e001	Home	\N	/	0	t	LINK	header	\N	\N	f	\N	\N	\N	2026-06-15 12:52:28.005	2026-06-15 12:52:28.005
00000000-0000-0000-0000-00000000e002	Products	Categories	/products	10	t	MEGA_CATEGORIES	header	\N	\N	t	\N	\N	\N	2026-06-15 12:52:28.014	2026-06-15 12:52:28.014
00000000-0000-0000-0000-00000000e003	Track order	\N	/track-order	20	t	LINK	header	\N	\N	f	\N	\N	\N	2026-06-15 12:52:28.018	2026-06-15 12:52:28.018
00000000-0000-0000-0000-00000000e005	Cart	\N	/cart	40	t	LINK	header	\N	\N	f	\N	\N	\N	2026-06-15 12:52:28.022	2026-06-15 12:52:28.022
\.


--
-- TOC entry 5491 (class 0 OID 18343)
-- Dependencies: 220
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, email, source, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5516 (class 0 OID 18788)
-- Dependencies: 245
-- Data for Name: tax_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_classes (id, code, name, description, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5517 (class 0 OID 18803)
-- Dependencies: 246
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taxes (id, tax_class_id, country, region, rate, is_inclusive, is_active, start_date, end_date, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5498 (class 0 OID 18452)
-- Dependencies: 227
-- Data for Name: variant_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variant_option_values (variant_id, option_id, value_id) FROM stdin;
\.


--
-- TOC entry 5068 (class 2606 OID 18342)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5241 (class 2606 OID 18891)
-- Name: account_creation_tokens account_creation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_creation_tokens
    ADD CONSTRAINT account_creation_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5249 (class 2606 OID 18925)
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5254 (class 2606 OID 18947)
-- Name: admin_role_permissions admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5251 (class 2606 OID 18940)
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5261 (class 2606 OID 18969)
-- Name: admin_user_roles admin_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 5259 (class 2606 OID 18962)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 18494)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5274 (class 2606 OID 19016)
-- Name: cms_banner_sliders cms_banner_sliders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_sliders
    ADD CONSTRAINT cms_banner_sliders_pkey PRIMARY KEY (id);


--
-- TOC entry 5276 (class 2606 OID 19034)
-- Name: cms_banner_slides cms_banner_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_pkey PRIMARY KEY (id);


--
-- TOC entry 5270 (class 2606 OID 19001)
-- Name: cms_blocks cms_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_blocks
    ADD CONSTRAINT cms_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5263 (class 2606 OID 18985)
-- Name: cms_pages cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_pages
    ADD CONSTRAINT cms_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5246 (class 2606 OID 18914)
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5230 (class 2606 OID 18861)
-- Name: customer_groups customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_groups
    ADD CONSTRAINT customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5237 (class 2606 OID 18878)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 5128 (class 2606 OID 18523)
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5134 (class 2606 OID 18538)
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 5145 (class 2606 OID 18600)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5202 (class 2606 OID 18772)
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- TOC entry 5225 (class 2606 OID 18845)
-- Name: order_taxes order_taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5141 (class 2606 OID 18571)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5151 (class 2606 OID 18621)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5158 (class 2606 OID 18640)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5124 (class 2606 OID 18505)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- TOC entry 5111 (class 2606 OID 18477)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5102 (class 2606 OID 18451)
-- Name: product_option_values_on_products product_option_values_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_pkey PRIMARY KEY (product_id, option_id, value_id);


--
-- TOC entry 5096 (class 2606 OID 18428)
-- Name: product_option_values product_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 18441)
-- Name: product_options_on_products product_options_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_pkey PRIMARY KEY (product_id, option_id);


--
-- TOC entry 5091 (class 2606 OID 18411)
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5083 (class 2606 OID 18396)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 18376)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5175 (class 2606 OID 18691)
-- Name: promotion_customer_groups promotion_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5186 (class 2606 OID 18708)
-- Name: promotion_logs promotion_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5169 (class 2606 OID 18679)
-- Name: promotion_products promotion_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_pkey PRIMARY KEY (id);


--
-- TOC entry 5163 (class 2606 OID 18670)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 5209 (class 2606 OID 18787)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5195 (class 2606 OID 18752)
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5190 (class 2606 OID 18728)
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5291 (class 2606 OID 19081)
-- Name: storefront_filter_options storefront_filter_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5287 (class 2606 OID 19064)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_pkey PRIMARY KEY (id);


--
-- TOC entry 5282 (class 2606 OID 19050)
-- Name: storefront_filters storefront_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filters
    ADD CONSTRAINT storefront_filters_pkey PRIMARY KEY (id);


--
-- TOC entry 5294 (class 2606 OID 19105)
-- Name: storefront_nav_links storefront_nav_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 18352)
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 18802)
-- Name: tax_classes tax_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_classes
    ADD CONSTRAINT tax_classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5220 (class 2606 OID 18822)
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 5107 (class 2606 OID 18461)
-- Name: variant_option_values variant_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_pkey PRIMARY KEY (variant_id, option_id);


--
-- TOC entry 5238 (class 1259 OID 19214)
-- Name: account_creation_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_email_idx ON public.account_creation_tokens USING btree (email);


--
-- TOC entry 5239 (class 1259 OID 19216)
-- Name: account_creation_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_expires_at_idx ON public.account_creation_tokens USING btree (expires_at);


--
-- TOC entry 5242 (class 1259 OID 19215)
-- Name: account_creation_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_creation_tokens_token_idx ON public.account_creation_tokens USING btree (token);


--
-- TOC entry 5243 (class 1259 OID 19213)
-- Name: account_creation_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX account_creation_tokens_token_key ON public.account_creation_tokens USING btree (token);


--
-- TOC entry 5247 (class 1259 OID 19218)
-- Name: admin_permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_permissions_key_key ON public.admin_permissions USING btree (key);


--
-- TOC entry 5252 (class 1259 OID 19219)
-- Name: admin_roles_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_roles_slug_key ON public.admin_roles USING btree (slug);


--
-- TOC entry 5255 (class 1259 OID 19221)
-- Name: admin_users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_email_idx ON public.admin_users USING btree (email);


--
-- TOC entry 5256 (class 1259 OID 19220)
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- TOC entry 5257 (class 1259 OID 19222)
-- Name: admin_users_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_users_is_active_idx ON public.admin_users USING btree (is_active);


--
-- TOC entry 5116 (class 1259 OID 19136)
-- Name: categories_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_is_active_idx ON public.categories USING btree (is_active);


--
-- TOC entry 5117 (class 1259 OID 19135)
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);


--
-- TOC entry 5120 (class 1259 OID 19134)
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- TOC entry 5121 (class 1259 OID 19133)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 5271 (class 1259 OID 19229)
-- Name: cms_banner_sliders_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_sliders_identifier_is_active_idx ON public.cms_banner_sliders USING btree (identifier, is_active);


--
-- TOC entry 5272 (class 1259 OID 19228)
-- Name: cms_banner_sliders_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_banner_sliders_identifier_key ON public.cms_banner_sliders USING btree (identifier);


--
-- TOC entry 5277 (class 1259 OID 19231)
-- Name: cms_banner_slides_slider_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_is_active_idx ON public.cms_banner_slides USING btree (slider_id, is_active);


--
-- TOC entry 5278 (class 1259 OID 19230)
-- Name: cms_banner_slides_slider_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_banner_slides_slider_id_sort_order_idx ON public.cms_banner_slides USING btree (slider_id, sort_order);


--
-- TOC entry 5267 (class 1259 OID 19227)
-- Name: cms_blocks_identifier_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_blocks_identifier_is_active_idx ON public.cms_blocks USING btree (identifier, is_active);


--
-- TOC entry 5268 (class 1259 OID 19226)
-- Name: cms_blocks_identifier_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_blocks_identifier_key ON public.cms_blocks USING btree (identifier);


--
-- TOC entry 5264 (class 1259 OID 19223)
-- Name: cms_pages_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_pages_slug_key ON public.cms_pages USING btree (slug);


--
-- TOC entry 5265 (class 1259 OID 19224)
-- Name: cms_pages_slug_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_slug_status_idx ON public.cms_pages USING btree (slug, status);


--
-- TOC entry 5266 (class 1259 OID 19225)
-- Name: cms_pages_status_updated_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_pages_status_updated_at_idx ON public.cms_pages USING btree (status, updated_at DESC);


--
-- TOC entry 5244 (class 1259 OID 19217)
-- Name: customer_addresses_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_addresses_customer_id_idx ON public.customer_addresses USING btree (customer_id);


--
-- TOC entry 5228 (class 1259 OID 19207)
-- Name: customer_groups_is_default_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_is_default_idx ON public.customer_groups USING btree (is_default);


--
-- TOC entry 5231 (class 1259 OID 19208)
-- Name: customer_groups_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_groups_tax_class_id_idx ON public.customer_groups USING btree (tax_class_id);


--
-- TOC entry 5232 (class 1259 OID 19211)
-- Name: customers_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_customer_group_id_idx ON public.customers USING btree (customer_group_id);


--
-- TOC entry 5233 (class 1259 OID 19210)
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- TOC entry 5234 (class 1259 OID 19209)
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- TOC entry 5235 (class 1259 OID 19212)
-- Name: customers_is_guest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_is_guest_idx ON public.customers USING btree (is_guest);


--
-- TOC entry 5126 (class 1259 OID 19141)
-- Name: inventory_items_available_quantity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_available_quantity_idx ON public.inventory_items USING btree (available_quantity);


--
-- TOC entry 5129 (class 1259 OID 19139)
-- Name: inventory_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_product_id_idx ON public.inventory_items USING btree (product_id);


--
-- TOC entry 5130 (class 1259 OID 19142)
-- Name: inventory_items_product_id_variant_id_warehouse_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inventory_items_product_id_variant_id_warehouse_id_key ON public.inventory_items USING btree (product_id, variant_id, warehouse_id);


--
-- TOC entry 5131 (class 1259 OID 19140)
-- Name: inventory_items_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_items_variant_id_idx ON public.inventory_items USING btree (variant_id);


--
-- TOC entry 5132 (class 1259 OID 19144)
-- Name: inventory_reservations_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_expires_at_idx ON public.inventory_reservations USING btree (expires_at);


--
-- TOC entry 5135 (class 1259 OID 19143)
-- Name: inventory_reservations_reference_type_reference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_reservations_reference_type_reference_id_idx ON public.inventory_reservations USING btree (reference_type, reference_id);


--
-- TOC entry 5143 (class 1259 OID 19150)
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- TOC entry 5146 (class 1259 OID 19151)
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- TOC entry 5198 (class 1259 OID 19192)
-- Name: order_shipping_courier_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_courier_code_idx ON public.order_shipping USING btree (courier_code);


--
-- TOC entry 5199 (class 1259 OID 19188)
-- Name: order_shipping_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_order_id_idx ON public.order_shipping USING btree (order_id);


--
-- TOC entry 5200 (class 1259 OID 19187)
-- Name: order_shipping_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX order_shipping_order_id_key ON public.order_shipping USING btree (order_id);


--
-- TOC entry 5203 (class 1259 OID 19193)
-- Name: order_shipping_shipped_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipped_at_idx ON public.order_shipping USING btree (shipped_at);


--
-- TOC entry 5204 (class 1259 OID 19189)
-- Name: order_shipping_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_shipping_method_id_idx ON public.order_shipping USING btree (shipping_method_id);


--
-- TOC entry 5205 (class 1259 OID 19190)
-- Name: order_shipping_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_status_idx ON public.order_shipping USING btree (status);


--
-- TOC entry 5206 (class 1259 OID 19191)
-- Name: order_shipping_tracking_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_shipping_tracking_number_idx ON public.order_shipping USING btree (tracking_number);


--
-- TOC entry 5223 (class 1259 OID 19204)
-- Name: order_taxes_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_order_id_idx ON public.order_taxes USING btree (order_id);


--
-- TOC entry 5226 (class 1259 OID 19206)
-- Name: order_taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_class_id_idx ON public.order_taxes USING btree (tax_class_id);


--
-- TOC entry 5227 (class 1259 OID 19205)
-- Name: order_taxes_tax_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_taxes_tax_id_idx ON public.order_taxes USING btree (tax_id);


--
-- TOC entry 5136 (class 1259 OID 19149)
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at DESC);


--
-- TOC entry 5137 (class 1259 OID 19147)
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- TOC entry 5138 (class 1259 OID 19146)
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- TOC entry 5139 (class 1259 OID 19145)
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- TOC entry 5142 (class 1259 OID 19148)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 5147 (class 1259 OID 19153)
-- Name: payment_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_code_idx ON public.payment_methods USING btree (code);


--
-- TOC entry 5148 (class 1259 OID 19152)
-- Name: payment_methods_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_methods_code_key ON public.payment_methods USING btree (code);


--
-- TOC entry 5149 (class 1259 OID 19155)
-- Name: payment_methods_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_is_active_idx ON public.payment_methods USING btree (is_active);


--
-- TOC entry 5152 (class 1259 OID 19154)
-- Name: payment_methods_provider_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_methods_provider_idx ON public.payment_methods USING btree (provider);


--
-- TOC entry 5153 (class 1259 OID 19160)
-- Name: payments_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_created_at_idx ON public.payments USING btree (created_at DESC);


--
-- TOC entry 5154 (class 1259 OID 19159)
-- Name: payments_gateway_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_gateway_transaction_id_idx ON public.payments USING btree (gateway_transaction_id);


--
-- TOC entry 5155 (class 1259 OID 19156)
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_order_id_idx ON public.payments USING btree (order_id);


--
-- TOC entry 5156 (class 1259 OID 19157)
-- Name: payments_payment_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_method_id_idx ON public.payments USING btree (payment_method_id);


--
-- TOC entry 5159 (class 1259 OID 19158)
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- TOC entry 5122 (class 1259 OID 19137)
-- Name: product_categories_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_category_id_idx ON public.product_categories USING btree (category_id);


--
-- TOC entry 5125 (class 1259 OID 19138)
-- Name: product_categories_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_categories_product_id_idx ON public.product_categories USING btree (product_id);


--
-- TOC entry 5112 (class 1259 OID 19129)
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- TOC entry 5113 (class 1259 OID 19131)
-- Name: product_images_product_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_is_primary_idx ON public.product_images USING btree (product_id, is_primary);


--
-- TOC entry 5114 (class 1259 OID 19130)
-- Name: product_images_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_idx ON public.product_images USING btree (variant_id);


--
-- TOC entry 5115 (class 1259 OID 19132)
-- Name: product_images_variant_id_is_primary_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_variant_id_is_primary_idx ON public.product_images USING btree (variant_id, is_primary);


--
-- TOC entry 5092 (class 1259 OID 19120)
-- Name: product_option_values_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_is_active_idx ON public.product_option_values USING btree (is_active);


--
-- TOC entry 5103 (class 1259 OID 19124)
-- Name: product_option_values_on_products_product_id_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_product_id_option_id_idx ON public.product_option_values_on_products USING btree (product_id, option_id);


--
-- TOC entry 5104 (class 1259 OID 19125)
-- Name: product_option_values_on_products_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_on_products_value_id_idx ON public.product_option_values_on_products USING btree (value_id);


--
-- TOC entry 5093 (class 1259 OID 19119)
-- Name: product_option_values_option_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_option_values_option_id_sort_order_idx ON public.product_option_values USING btree (option_id, sort_order);


--
-- TOC entry 5094 (class 1259 OID 19121)
-- Name: product_option_values_option_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_option_values_option_id_value_key ON public.product_option_values USING btree (option_id, value);


--
-- TOC entry 5087 (class 1259 OID 19118)
-- Name: product_options_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_code_idx ON public.product_options USING btree (code);


--
-- TOC entry 5088 (class 1259 OID 19116)
-- Name: product_options_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_options_code_key ON public.product_options USING btree (code);


--
-- TOC entry 5089 (class 1259 OID 19117)
-- Name: product_options_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_is_active_idx ON public.product_options USING btree (is_active);


--
-- TOC entry 5097 (class 1259 OID 19123)
-- Name: product_options_on_products_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_option_id_idx ON public.product_options_on_products USING btree (option_id);


--
-- TOC entry 5100 (class 1259 OID 19122)
-- Name: product_options_on_products_product_id_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_options_on_products_product_id_position_idx ON public.product_options_on_products USING btree (product_id, "position");


--
-- TOC entry 5081 (class 1259 OID 19115)
-- Name: product_variants_is_active_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_is_active_product_id_idx ON public.product_variants USING btree (is_active, product_id);


--
-- TOC entry 5084 (class 1259 OID 19113)
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- TOC entry 5085 (class 1259 OID 19114)
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- TOC entry 5086 (class 1259 OID 19112)
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- TOC entry 5075 (class 1259 OID 19110)
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- TOC entry 5076 (class 1259 OID 19106)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5077 (class 1259 OID 19109)
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- TOC entry 5078 (class 1259 OID 19107)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 5079 (class 1259 OID 19108)
-- Name: products_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_deleted_at_idx ON public.products USING btree (status, deleted_at);


--
-- TOC entry 5080 (class 1259 OID 19111)
-- Name: products_visibility_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_visibility_status_deleted_at_idx ON public.products USING btree (visibility, status, deleted_at);


--
-- TOC entry 5173 (class 1259 OID 19171)
-- Name: promotion_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_customer_group_id_idx ON public.promotion_customer_groups USING btree (customer_group_id);


--
-- TOC entry 5176 (class 1259 OID 19173)
-- Name: promotion_customer_groups_promotion_id_customer_group_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotion_customer_groups_promotion_id_customer_group_id_key ON public.promotion_customer_groups USING btree (promotion_id, customer_group_id);


--
-- TOC entry 5177 (class 1259 OID 19170)
-- Name: promotion_customer_groups_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_idx ON public.promotion_customer_groups USING btree (promotion_id);


--
-- TOC entry 5178 (class 1259 OID 19172)
-- Name: promotion_customer_groups_promotion_id_is_excluded_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_customer_groups_promotion_id_is_excluded_idx ON public.promotion_customer_groups USING btree (promotion_id, is_excluded);


--
-- TOC entry 5179 (class 1259 OID 19175)
-- Name: promotion_logs_cart_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_cart_id_idx ON public.promotion_logs USING btree (cart_id);


--
-- TOC entry 5180 (class 1259 OID 19176)
-- Name: promotion_logs_checkout_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_checkout_id_idx ON public.promotion_logs USING btree (checkout_id);


--
-- TOC entry 5181 (class 1259 OID 19179)
-- Name: promotion_logs_coupon_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_coupon_code_idx ON public.promotion_logs USING btree (coupon_code);


--
-- TOC entry 5182 (class 1259 OID 19180)
-- Name: promotion_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_created_at_idx ON public.promotion_logs USING btree (created_at DESC);


--
-- TOC entry 5183 (class 1259 OID 19178)
-- Name: promotion_logs_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_customer_id_idx ON public.promotion_logs USING btree (customer_id);


--
-- TOC entry 5184 (class 1259 OID 19177)
-- Name: promotion_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_order_id_idx ON public.promotion_logs USING btree (order_id);


--
-- TOC entry 5187 (class 1259 OID 19174)
-- Name: promotion_logs_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_logs_promotion_id_idx ON public.promotion_logs USING btree (promotion_id);


--
-- TOC entry 5167 (class 1259 OID 19169)
-- Name: promotion_products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_category_id_idx ON public.promotion_products USING btree (category_id);


--
-- TOC entry 5170 (class 1259 OID 19167)
-- Name: promotion_products_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_product_id_idx ON public.promotion_products USING btree (product_id);


--
-- TOC entry 5171 (class 1259 OID 19166)
-- Name: promotion_products_promotion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_promotion_id_idx ON public.promotion_products USING btree (promotion_id);


--
-- TOC entry 5172 (class 1259 OID 19168)
-- Name: promotion_products_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotion_products_variant_id_idx ON public.promotion_products USING btree (variant_id);


--
-- TOC entry 5160 (class 1259 OID 19162)
-- Name: promotions_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_code_idx ON public.promotions USING btree (code);


--
-- TOC entry 5161 (class 1259 OID 19161)
-- Name: promotions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotions_code_key ON public.promotions USING btree (code);


--
-- TOC entry 5164 (class 1259 OID 19164)
-- Name: promotions_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_start_date_end_date_idx ON public.promotions USING btree (start_date, end_date);


--
-- TOC entry 5165 (class 1259 OID 19163)
-- Name: promotions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_idx ON public.promotions USING btree (status);


--
-- TOC entry 5166 (class 1259 OID 19165)
-- Name: promotions_status_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promotions_status_start_date_end_date_idx ON public.promotions USING btree (status, start_date, end_date);


--
-- TOC entry 5207 (class 1259 OID 19195)
-- Name: shipping_method_customer_groups_customer_group_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_customer_group_id_idx ON public.shipping_method_customer_groups USING btree (customer_group_id);


--
-- TOC entry 5210 (class 1259 OID 19196)
-- Name: shipping_method_customer_groups_shipping_method_id_customer_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX shipping_method_customer_groups_shipping_method_id_customer_key ON public.shipping_method_customer_groups USING btree (shipping_method_id, customer_group_id);


--
-- TOC entry 5211 (class 1259 OID 19194)
-- Name: shipping_method_customer_groups_shipping_method_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_method_customer_groups_shipping_method_id_idx ON public.shipping_method_customer_groups USING btree (shipping_method_id);


--
-- TOC entry 5192 (class 1259 OID 19184)
-- Name: shipping_methods_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_code_idx ON public.shipping_methods USING btree (code);


--
-- TOC entry 5193 (class 1259 OID 19185)
-- Name: shipping_methods_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_is_active_priority_idx ON public.shipping_methods USING btree (is_active, priority);


--
-- TOC entry 5196 (class 1259 OID 19186)
-- Name: shipping_methods_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_type_idx ON public.shipping_methods USING btree (type);


--
-- TOC entry 5197 (class 1259 OID 19183)
-- Name: shipping_methods_zone_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_methods_zone_id_idx ON public.shipping_methods USING btree (zone_id);


--
-- TOC entry 5188 (class 1259 OID 19181)
-- Name: shipping_zones_is_active_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_is_active_priority_idx ON public.shipping_zones USING btree (is_active, priority);


--
-- TOC entry 5191 (class 1259 OID 19182)
-- Name: shipping_zones_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipping_zones_priority_idx ON public.shipping_zones USING btree (priority);


--
-- TOC entry 5288 (class 1259 OID 19237)
-- Name: storefront_filter_options_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_options_filter_id_is_active_sort_order_idx ON public.storefront_filter_options USING btree (filter_id, is_active, sort_order);


--
-- TOC entry 5289 (class 1259 OID 19238)
-- Name: storefront_filter_options_filter_id_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_options_filter_id_value_key ON public.storefront_filter_options USING btree (filter_id, value);


--
-- TOC entry 5283 (class 1259 OID 19235)
-- Name: storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, is_active, sort_order);


--
-- TOC entry 5284 (class 1259 OID 19236)
-- Name: storefront_filter_tree_nodes_filter_id_nav_link_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filter_tree_nodes_filter_id_nav_link_id_key ON public.storefront_filter_tree_nodes USING btree (filter_id, nav_link_id);


--
-- TOC entry 5285 (class 1259 OID 19234)
-- Name: storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx ON public.storefront_filter_tree_nodes USING btree (filter_id, parent_id, sort_order);


--
-- TOC entry 5279 (class 1259 OID 19232)
-- Name: storefront_filters_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX storefront_filters_code_key ON public.storefront_filters USING btree (code);


--
-- TOC entry 5280 (class 1259 OID 19233)
-- Name: storefront_filters_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_filters_is_active_sort_order_idx ON public.storefront_filters USING btree (is_active, sort_order);


--
-- TOC entry 5292 (class 1259 OID 19239)
-- Name: storefront_nav_links_is_active_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_is_active_sort_order_idx ON public.storefront_nav_links USING btree (is_active, sort_order);


--
-- TOC entry 5295 (class 1259 OID 19240)
-- Name: storefront_nav_links_zone_parent_id_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX storefront_nav_links_zone_parent_id_sort_order_idx ON public.storefront_nav_links USING btree (zone, parent_id, sort_order);


--
-- TOC entry 5069 (class 1259 OID 18354)
-- Name: subscribers_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscribers_created_at_idx ON public.subscribers USING btree (created_at DESC);


--
-- TOC entry 5070 (class 1259 OID 18353)
-- Name: subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers USING btree (email);


--
-- TOC entry 5212 (class 1259 OID 19198)
-- Name: tax_classes_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tax_classes_code_idx ON public.tax_classes USING btree (code);


--
-- TOC entry 5213 (class 1259 OID 19197)
-- Name: tax_classes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tax_classes_code_key ON public.tax_classes USING btree (code);


--
-- TOC entry 5216 (class 1259 OID 19200)
-- Name: taxes_country_region_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_idx ON public.taxes USING btree (country, region);


--
-- TOC entry 5217 (class 1259 OID 19203)
-- Name: taxes_country_region_tax_class_id_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_country_region_tax_class_id_is_active_idx ON public.taxes USING btree (country, region, tax_class_id, is_active);


--
-- TOC entry 5218 (class 1259 OID 19201)
-- Name: taxes_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_is_active_idx ON public.taxes USING btree (is_active);


--
-- TOC entry 5221 (class 1259 OID 19202)
-- Name: taxes_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_start_date_end_date_idx ON public.taxes USING btree (start_date, end_date);


--
-- TOC entry 5222 (class 1259 OID 19199)
-- Name: taxes_tax_class_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX taxes_tax_class_id_idx ON public.taxes USING btree (tax_class_id);


--
-- TOC entry 5105 (class 1259 OID 19127)
-- Name: variant_option_values_option_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_option_id_idx ON public.variant_option_values USING btree (option_id);


--
-- TOC entry 5108 (class 1259 OID 19128)
-- Name: variant_option_values_value_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_value_id_idx ON public.variant_option_values USING btree (value_id);


--
-- TOC entry 5109 (class 1259 OID 19126)
-- Name: variant_option_values_variant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX variant_option_values_variant_id_idx ON public.variant_option_values USING btree (variant_id);


--
-- TOC entry 5332 (class 2606 OID 19426)
-- Name: admin_role_permissions admin_role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5333 (class 2606 OID 19421)
-- Name: admin_role_permissions admin_role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5334 (class 2606 OID 19436)
-- Name: admin_user_roles admin_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5335 (class 2606 OID 19431)
-- Name: admin_user_roles admin_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_user_roles
    ADD CONSTRAINT admin_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5309 (class 2606 OID 19306)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5336 (class 2606 OID 19441)
-- Name: cms_banner_slides cms_banner_slides_slider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_banner_slides
    ADD CONSTRAINT cms_banner_slides_slider_id_fkey FOREIGN KEY (slider_id) REFERENCES public.cms_banner_sliders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5331 (class 2606 OID 19416)
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5330 (class 2606 OID 19411)
-- Name: customers customers_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5312 (class 2606 OID 19321)
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5313 (class 2606 OID 19326)
-- Name: inventory_items inventory_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5314 (class 2606 OID 19331)
-- Name: inventory_reservations inventory_reservations_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5316 (class 2606 OID 19341)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5323 (class 2606 OID 19376)
-- Name: order_shipping order_shipping_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5324 (class 2606 OID 19381)
-- Name: order_shipping order_shipping_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5328 (class 2606 OID 19401)
-- Name: order_taxes order_taxes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5329 (class 2606 OID 19406)
-- Name: order_taxes order_taxes_tax_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES public.taxes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5315 (class 2606 OID 19336)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5317 (class 2606 OID 19346)
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5310 (class 2606 OID 19316)
-- Name: product_categories product_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5311 (class 2606 OID 19311)
-- Name: product_categories product_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5307 (class 2606 OID 19296)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5308 (class 2606 OID 19301)
-- Name: product_images product_images_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5300 (class 2606 OID 19266)
-- Name: product_option_values_on_products product_option_values_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5301 (class 2606 OID 19261)
-- Name: product_option_values_on_products product_option_values_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5302 (class 2606 OID 19276)
-- Name: product_option_values_on_products product_option_values_on_products_product_id_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_product_id_option_id_fkey FOREIGN KEY (product_id, option_id) REFERENCES public.product_options_on_products(product_id, option_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5303 (class 2606 OID 19271)
-- Name: product_option_values_on_products product_option_values_on_products_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values_on_products
    ADD CONSTRAINT product_option_values_on_products_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5297 (class 2606 OID 19246)
-- Name: product_option_values product_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT product_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5298 (class 2606 OID 19256)
-- Name: product_options_on_products product_options_on_products_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5299 (class 2606 OID 19251)
-- Name: product_options_on_products product_options_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options_on_products
    ADD CONSTRAINT product_options_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5296 (class 2606 OID 19241)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5319 (class 2606 OID 19361)
-- Name: promotion_customer_groups promotion_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5320 (class 2606 OID 19356)
-- Name: promotion_customer_groups promotion_customer_groups_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_customer_groups
    ADD CONSTRAINT promotion_customer_groups_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5321 (class 2606 OID 19366)
-- Name: promotion_logs promotion_logs_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_logs
    ADD CONSTRAINT promotion_logs_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5318 (class 2606 OID 19351)
-- Name: promotion_products promotion_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5325 (class 2606 OID 19391)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_customer_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_customer_group_id_fkey FOREIGN KEY (customer_group_id) REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5326 (class 2606 OID 19386)
-- Name: shipping_method_customer_groups shipping_method_customer_groups_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_method_customer_groups
    ADD CONSTRAINT shipping_method_customer_groups_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5322 (class 2606 OID 19371)
-- Name: shipping_methods shipping_methods_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5340 (class 2606 OID 19461)
-- Name: storefront_filter_options storefront_filter_options_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_options
    ADD CONSTRAINT storefront_filter_options_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5337 (class 2606 OID 19446)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.storefront_filters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5338 (class 2606 OID 19456)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_nav_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_nav_link_id_fkey FOREIGN KEY (nav_link_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5339 (class 2606 OID 19451)
-- Name: storefront_filter_tree_nodes storefront_filter_tree_nodes_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_filter_tree_nodes
    ADD CONSTRAINT storefront_filter_tree_nodes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_filter_tree_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5341 (class 2606 OID 19471)
-- Name: storefront_nav_links storefront_nav_links_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5342 (class 2606 OID 19466)
-- Name: storefront_nav_links storefront_nav_links_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storefront_nav_links
    ADD CONSTRAINT storefront_nav_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.storefront_nav_links(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5327 (class 2606 OID 19396)
-- Name: taxes taxes_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_tax_class_id_fkey FOREIGN KEY (tax_class_id) REFERENCES public.tax_classes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5304 (class 2606 OID 19286)
-- Name: variant_option_values variant_option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.product_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5305 (class 2606 OID 19291)
-- Name: variant_option_values variant_option_values_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.product_option_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5306 (class 2606 OID 19281)
-- Name: variant_option_values variant_option_values_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variant_option_values
    ADD CONSTRAINT variant_option_values_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-06-15 18:17:45

--
-- PostgreSQL database dump complete
--

\unrestrict V40PtDrJPuPAur8PaA2d5NKYjG1oL4vZIZgAa0dAspCxLcJ1t2TjJ43vl06ew2b

