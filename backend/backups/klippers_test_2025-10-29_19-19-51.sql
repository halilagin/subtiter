--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17
-- Dumped by pg_dump version 14.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: groups; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying
);


ALTER TABLE public.groups OWNER TO klippersuser;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: klippersuser
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO klippersuser;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: klippersuser
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying,
    permissions character varying
);


ALTER TABLE public.roles OWNER TO klippersuser;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: klippersuser
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO klippersuser;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: klippersuser
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: stripe_document_meters; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.stripe_document_meters (
    document_id character varying NOT NULL,
    user_email character varying NOT NULL,
    subscription_id character varying NOT NULL
);


ALTER TABLE public.stripe_document_meters OWNER TO klippersuser;

--
-- Name: user_groups; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.user_groups (
    user_id character varying NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.user_groups OWNER TO klippersuser;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.user_roles (
    user_id character varying NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.user_roles OWNER TO klippersuser;

--
-- Name: user_video_process_statuses; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.user_video_process_statuses (
    id character varying NOT NULL,
    user_video_id character varying NOT NULL,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.user_video_process_statuses OWNER TO klippersuser;

--
-- Name: user_videos; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.user_videos (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    video_id character varying NOT NULL,
    config_json json,
    video_duration integer,
    processing_started_at timestamp without time zone,
    processing_completed_at timestamp without time zone,
    uploaded_at timestamp without time zone,
    created_at timestamp without time zone,
    status character varying,
    meta_data json
);


ALTER TABLE public.user_videos OWNER TO klippersuser;

--
-- Name: users; Type: TABLE; Schema: public; Owner: klippersuser
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    username character varying,
    name character varying,
    hashed_password character varying,
    is_active boolean,
    is_superuser boolean,
    subscription_config_json json,
    subscription_expires_at timestamp without time zone,
    subscription_status character varying,
    subscription_created_at timestamp without time zone,
    subscription_updated_at timestamp without time zone,
    subscription_plan character varying,
    subscription_id character varying
);


ALTER TABLE public.users OWNER TO klippersuser;

--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.groups (id, name) FROM stdin;
1	developers
2	testers
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.roles (id, name, permissions) FROM stdin;
1	admin	\N
2	user	\N
\.


--
-- Data for Name: stripe_document_meters; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.stripe_document_meters (document_id, user_email, subscription_id) FROM stdin;
\.


--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.user_groups (user_id, group_id, created_at) FROM stdin;
8c8ef5c7-f30e-44c4-a370-2011b837988d	2	2025-09-08 14:23:45.953406
ab4a03be-9a17-45d0-93d9-de60d61e8f54	2	2025-09-08 14:23:45.953411
8c8ef5c7-f30e-44c4-a370-2011b837988d	1	2025-09-08 14:23:45.953412
941c39a4-185b-4961-9fc8-642fe2f44e51	1	2025-09-08 14:23:45.953413
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.user_roles (user_id, role_id, created_at) FROM stdin;
941c39a4-185b-4961-9fc8-642fe2f44e51	2	2025-09-08 14:23:45.954381
ab4a03be-9a17-45d0-93d9-de60d61e8f54	2	2025-09-08 14:23:45.954383
8c8ef5c7-f30e-44c4-a370-2011b837988d	1	2025-09-08 14:23:45.954384
\.


--
-- Data for Name: user_video_process_statuses; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.user_video_process_statuses (id, user_video_id, status, created_at, updated_at) FROM stdin;
e5001201-5c5f-4fa8-9593-9e2c8c09c60c	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	uploaded	2025-09-15 16:56:51.755877	2025-09-15 16:56:51.75588
538d1e42-c366-46cb-a523-2a758656769b	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	extracted-audio	2025-09-15 16:56:56.490809	2025-09-15 16:56:56.490812
20af2684-a56b-4777-baf4-f0872d444860	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	transcribed	2025-09-15 16:57:01.146437	2025-09-15 16:57:01.146441
6e430a82-dcb8-4127-a52a-9b47a5e56cc8	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	converted-srt-to-txt	2025-09-15 16:57:05.588663	2025-09-15 16:57:05.588666
32c929b5-463b-40fc-a5fa-87d7645926f5	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	important-segments-extracted	2025-09-15 16:57:09.984293	2025-09-15 16:57:09.984296
808d22d2-5c04-48c3-acc9-843387966fd7	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	video-segments-extracted	2025-09-15 16:57:14.748839	2025-09-15 16:57:14.748841
c6c451d9-eb14-44d5-ad91-2add99abf8bb	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	cropped-and-stacked	2025-09-15 16:57:19.362815	2025-09-15 16:57:19.362818
944361ba-a93d-4544-8ac7-87c1da2f5943	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	extracted-audio-for-cropped-video	2025-09-15 16:57:24.155337	2025-09-15 16:57:24.15534
1193bc9b-6d10-439d-b505-70d54569aafb	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	transcribed-word-level-ass	2025-09-15 16:57:28.948099	2025-09-15 16:57:28.948102
8f2c510e-f9aa-40f9-9227-d21fa874a11f	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	converted-ass-to-txt	2025-09-15 16:57:33.691414	2025-09-15 16:57:33.691417
fd26a52a-5f73-4f56-a7e4-fa480e2bd030	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	embedded-subtitles	2025-09-15 16:57:39.194145	2025-09-15 16:57:39.194148
c0afac41-5dc7-4997-83a4-c3d18968eaa5	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	completed	2025-09-15 16:57:44.248191	2025-09-15 16:57:44.248194
e8955f91-d53f-4fbe-a1d4-d23646af5727	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	uploaded	2025-09-15 16:59:08.432816	2025-09-15 16:59:08.43282
82cc2fe5-e044-40e5-8f2b-a45ea2df1b4d	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	extracted-audio	2025-09-15 16:59:12.813443	2025-09-15 16:59:12.813445
7c2be3fc-fbe6-4c93-8bf4-789611d7a90d	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	transcribed	2025-09-15 16:59:17.632116	2025-09-15 16:59:17.632119
22377a68-7aab-4019-bc0a-f3ab325030f6	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	converted-srt-to-txt	2025-09-15 16:59:22.234004	2025-09-15 16:59:22.234006
14190ea7-7b6a-48e6-b639-564a90d96d6e	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	important-segments-extracted	2025-09-15 16:59:26.710871	2025-09-15 16:59:26.710874
ba9c7564-ddd7-4777-887d-10abf64a9530	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	video-segments-extracted	2025-09-15 16:59:31.455668	2025-09-15 16:59:31.455671
1c09fa26-4c0d-47f4-98ef-61d58f8fe202	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	cropped-and-stacked	2025-09-15 16:59:36.038419	2025-09-15 16:59:36.038422
e666539f-c478-497b-b8b3-741e12f27c1b	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	extracted-audio-for-cropped-video	2025-09-15 16:59:40.703274	2025-09-15 16:59:40.703276
57598a21-1253-4bf5-a52b-4f628a2ae10c	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	transcribed-word-level-ass	2025-09-15 16:59:45.421411	2025-09-15 16:59:45.421414
b6ee9fd5-b980-4353-b05b-ad915873f5b5	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	converted-ass-to-txt	2025-09-15 16:59:50.089144	2025-09-15 16:59:50.089148
c999ca74-67be-4320-8b8c-ce64c5912ff7	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	embedded-subtitles	2025-09-15 16:59:55.716882	2025-09-15 16:59:55.716885
3a2a0014-b17a-4d59-9f61-80fc7d4beb28	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	completed	2025-09-15 17:00:00.863194	2025-09-15 17:00:00.863197
b53203a7-5739-49bc-bb70-568c43b42906	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	uploaded	2025-09-16 16:06:02.069755	2025-09-16 16:06:02.069758
c4c730c7-ceba-4bb7-a5ea-4c6761c37ed6	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	extracted-audio	2025-09-16 16:06:06.416898	2025-09-16 16:06:06.416901
fccc394f-76ee-4ca1-9bc9-724cfcab5a93	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	transcribed	2025-09-16 16:06:10.709498	2025-09-16 16:06:10.709501
b290b14f-9ded-4519-997f-241f808013ff	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	converted-srt-to-txt	2025-09-16 16:06:15.059824	2025-09-16 16:06:15.059826
ba5c66cb-dc02-4bfe-a648-304b440ecf80	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	important-segments-extracted	2025-09-16 16:06:19.41589	2025-09-16 16:06:19.415893
f4ded645-bcfb-4193-92f0-c08bb78bb0a3	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	video-segments-extracted	2025-09-16 16:06:23.781255	2025-09-16 16:06:23.781258
3e483de1-5f7d-4f24-8a62-7338357f7e53	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	cropped-and-stacked	2025-09-16 16:06:28.132931	2025-09-16 16:06:28.132934
a022fd26-3205-4a12-8657-695bef2104d0	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	extracted-audio-for-cropped-video	2025-09-16 16:06:32.487391	2025-09-16 16:06:32.487394
041a040b-b648-415e-9110-6acb7fdba42d	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	transcribed-word-level-ass	2025-09-16 16:06:36.930141	2025-09-16 16:06:36.930144
3e50047c-387d-441e-9c60-eca2fa51900b	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	converted-ass-to-txt	2025-09-16 16:06:41.647214	2025-09-16 16:06:41.647217
92553877-6688-4eaf-842c-1f34f6c4db53	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	embedded-subtitles	2025-09-16 16:06:47.072253	2025-09-16 16:06:47.072255
4bb493ab-6102-45c4-b399-886ea77f4d11	f1f3106a-2a75-4ba6-8c31-2c13d0773721-fe80098a-f9b8-4a4a-8177-e657799bb59b	completed	2025-09-16 16:06:52.051891	2025-09-16 16:06:52.051894
\.


--
-- Data for Name: user_videos; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.user_videos (id, user_id, video_id, config_json, video_duration, processing_started_at, processing_completed_at, uploaded_at, created_at, status, meta_data) FROM stdin;
41f21be3-dcf1-4f7d-ba53-f79d7c7b925f	f1f3106a-2a75-4ba6-8c31-2c13d0773721	f7143179-7169-44a0-8063-54f7af6adf79	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	100	2025-08-08 22:33:11	2025-08-08 22:40:11	2025-08-08 14:06:09.375327	2025-08-08 14:06:09.37533	completed	{}
30af39aa-f62f-4eeb-bf0d-4e3bf4507b96	f1f3106a-2a75-4ba6-8c31-2c13d0773721	12fad16c-65c7-4b51-bfbe-6974225cfd83	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	100	2025-08-08 22:33:11	2025-08-08 22:40:24	2025-08-08 22:32:37.612461	2025-08-08 22:32:37.612463	completed	{}
4e4c514d-ae2a-49c6-9ad9-78a3b60704ac	f1f3106a-2a75-4ba6-8c31-2c13d0773721	8f283f57-9481-49b4-ac0c-9d0fc060015b	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	100	2025-08-08 22:33:11	2025-08-08 22:40:46	2025-08-08 22:17:31.453477	2025-08-08 22:17:31.45348	completed	{}
dc29d620-686b-457e-a66e-e841d2be45b0	75ecc888-f71e-4297-a1f7-1931a207d95d	06ba2f48-667b-47f7-bc70-776b3d55632c	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	\N	\N	\N	2025-09-15 16:56:46.855101	2025-09-15 16:56:46.855107	uploaded	{}
171a237d-6c1a-4960-ad7c-4f3610add848	6275b414-c061-70ce-8048-c12ba5d9b728	bc174783-6b66-4887-b54a-14c691e6ab7e	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	600	\N	\N	2025-10-26 18:16:13.41445	2025-10-26 18:16:13.414464	uploaded	{}
c207c9c0-5108-4c9f-8e6e-c08b38fc4cff	f1f3106a-2a75-4ba6-8c31-2c13d0773721	fe80098a-f9b8-4a4a-8177-e657799bb59b	{"config_json": {"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}}	100	2025-09-16 16:05:58	2025-09-16 16:06:48	2025-08-08 22:24:11.473884	2025-08-08 22:24:11.473886	completed	{}
e62702bc-3ff6-4208-8343-8b261ee83bd9	75ecc888-f71e-4297-a1f7-1931a207d95d	a6f74938-b65b-4625-9fcd-d2824a114ab2	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	\N	\N	\N	2025-09-15 16:59:05.063043	2025-09-15 16:59:05.063046	uploaded	{}
79ef02b5-db8b-4224-8244-627b5bd41452	75ecc888-f71e-4297-a1f7-1931a207d95d	4520fc29-5dee-4340-82a8-80dff5506eb9	{"segment_count": 10, "capitalize_words": true, "capitalize_first_char_in_words": true, "video_people_context": "podcast", "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "target_short_video_length": 60, "language_code": "en", "video_aspect_ratio": "16:9", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "dissaminate_on_social_media_json": {"facebook": false, "instagram": false, "twitter": false, "linkedin": false, "youtube": false, "tiktok": false, "pinterest": false, "reddit": false, "snapchat": false, "telegram": false}}	\N	\N	\N	2025-09-16 16:05:58.253852	2025-09-16 16:05:58.253858	uploaded	{}
b1c7bdbc-2c43-4bf4-b07f-84853b3c1033	6275b414-c061-70ce-8048-c12ba5d9b728	8477b77a-eee2-4306-99b2-c14f1bcd8f4c	{"config_json": {"subtitle_style": "deep_diver", "subtitle_capitalization_method": "uppercase", "video_people_context": "podcast", "original_video_thumbnail_url": "http://localhost:23081/api/v1/user-videos/video-thumbnail/6275b414-c061-70ce-8048-c12ba5d9b728/8477b77a-eee2-4306-99b2-c14f1bcd8f4c", "original_video_duration_in_seconds": 600, "target_short_video_duration_in_seconds": 60, "target_video_trim_start_in_seconds": 0, "target_video_trim_end_in_seconds": 150, "how_many_people_in_video": 1, "dissaminate_on_social_media": true, "segment_count": "2", "language_code": "en", "video_aspect_ratio": "9:16", "generate_engaging_captions": true, "use_emojis_in_ass_words": true, "video_type": "video", "video_format": "mp4", "video_resolution": "1920x1080", "cropping_reference_image_time_interval": 16, "cropping_operator": "AI", "ffmpeg_thread_count": 10, "ffmpeg_preset": "ultrafast", "ffmpeg_crf": 30}}	600	\N	\N	2025-10-28 14:15:41.843132	2025-10-28 14:15:41.843142	uploaded	{}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: klippersuser
--

COPY public.users (id, email, username, name, hashed_password, is_active, is_superuser, subscription_config_json, subscription_expires_at, subscription_status, subscription_created_at, subscription_updated_at, subscription_plan, subscription_id) FROM stdin;
8c8ef5c7-f30e-44c4-a370-2011b837988d	admin@example.com	admin	\N	$2b$12$ntlpW3M4CGI10If.mRTdd.jEOgwD2c29ug3GJLISEkIF9OkRrAqRC	t	t	{"max_monthly_video_duration": 10000, "max_monthly_video_count": 1000, "max_monthly_video_count_per_user": 100, "max_monthly_video_count_per_user_per_week": 100, "max_monthly_video_count_per_user_per_month": 1000, "max_monthly_video_count_per_user_per_year": 10000}	\N	\N	\N	\N	\N	\N
941c39a4-185b-4961-9fc8-642fe2f44e51	john@example.com	john_doe	\N	$2b$12$gUAGPQTeo.qcKkQq2qCOAeohE8W19PCFlbPr6jWo5UT2LrA7NU4M2	t	f	{"max_monthly_video_duration": 10000, "max_monthly_video_count": 1000, "max_monthly_video_count_per_user": 100, "max_monthly_video_count_per_user_per_week": 100, "max_monthly_video_count_per_user_per_month": 1000, "max_monthly_video_count_per_user_per_year": 10000}	\N	\N	\N	\N	\N	\N
ab4a03be-9a17-45d0-93d9-de60d61e8f54	jane@example.com	jane_doe	\N	$2b$12$sxZ3qgPzEOY5fPabg/CkI.8.817jdo5i2d6Yn4Vb4eMCsrcuhYoWS	t	f	{"max_monthly_video_duration": 10000, "max_monthly_video_count": 1000, "max_monthly_video_count_per_user": 100, "max_monthly_video_count_per_user_per_week": 100, "max_monthly_video_count_per_user_per_month": 1000, "max_monthly_video_count_per_user_per_year": 10000}	\N	\N	\N	\N	\N	\N
f1f3106a-2a75-4ba6-8c31-2c13d0773721	halil.agin+klippers@gmail.com	halilagintest	\N	$2b$12$m4/ZVI6r6sGMNUMKpHuKAeMuYlhWpOV2U501ozDm4DN5QZc11nyui	t	f	{"max_monthly_video_duration": 10000, "max_monthly_video_count": 1000, "max_monthly_video_count_per_user": 100, "max_monthly_video_count_per_user_per_week": 100, "max_monthly_video_count_per_user_per_month": 1000, "max_monthly_video_count_per_user_per_year": 10000}	2026-09-08 14:23:45.925379	\N	2025-09-08 14:23:45.925376	2025-09-08 14:23:45.925379	VOLUME_BASED_PAYMENT	sub_1RVEu3Gg0tCTvsYGY9Kh23RF
21068a58-d017-4ed2-8750-72bed6e86967	berfin.agin+klippers213@gmail.com	9eb892ae-7735-4bf7-be40-173a72de2621	berfin agin	$2b$12$KcbU3i2WhE5hpAmJQMQ/3e949uNp2saWBszsZ3o87UMMoNsneY3rG	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
da4bfc9d-5ef4-4d3d-832f-efa6946277fa	berfin.agin+klippers214@gmail.com	9e674a53-ad90-47c0-a13c-80f34d7c4b59	berfin 	$2b$12$QqmBxlU7FN8eYyQ9uXZ9duURT7pnulOy8dUwfxx6oHa3L5x1QtQvW	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
72e6bfb6-d709-4962-a6c2-649bd1f763ba	berfin.agin+klippers215@gmail.com	d93c952f-4531-4ef4-ab25-feb27eaf58c3	berfin 	$2b$12$mEoh4cFpvMr0D0Fef20ZieQ7Jf2gM9naFr8QWqgQnAKQXAgWjAZIO	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
961b95cd-4c63-46fd-a3a3-3c1a107b36c7	berfin.agin+klippers216@gmail.com	7b1a9eaf-4cfe-4896-86e1-1c6a42f0814b	berfin agin	$2b$12$jB/BvcoF9GnHtdx0aa8bJeKwd4TUW7aJzytOTl/sdVxLEVtH.P33G	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
75ecc888-f71e-4297-a1f7-1931a207d95d	berfin.agin+klippers217@gmail.com	6b8a933e-6fcf-411b-8eb4-aec6eb34d347	berfin agin	$2b$12$rdQvUY1uE3YMFtZ/szdH.uYTfhD0ppvVSlWpVSqlmRg7r6j39wNEi	t	f	\N	\N	\N	\N	2025-09-08 14:36:24.029379	klippers_level1	sub_1S56B2Gg0tCTvsYGFf32UdEB
a36b5caa-acb3-4e1e-8546-272a6f9ef1e9	berfin.agin+klippers219@gmail.com	cff23ef8-6d6b-4ed2-835f-294ed269fb07	berfin	$2b$12$nQ8W3XWW36XXI2VAAi7GW.Z.tH9KYDRZbuDMDcgWR0r5JnIkXyuee	t	f	\N	\N	\N	\N	2025-09-08 14:40:55.523299	klippers_level1	sub_1S56FQGg0tCTvsYGpZqB0aEt
d53231bf-7c9e-4575-a923-581ae326e159	berfin.agin+klippers220@gmail.com	0c5d330b-0874-4edf-a7a2-6d02a3b74df4	berfin	$2b$12$weZcDYIf3SKzFlw95wtUvusQBwyrHb.WevC75H9kmVo/AVIN6C7je	t	f	\N	\N	\N	\N	2025-09-08 14:41:27.00128	klippers_level1	sub_1S56FvGg0tCTvsYGodz2hC1f
a54936ec-6478-45f7-8738-399d10fba589	berfin.agin+klippers218@gmail.com	cbb7a9eb-b451-49a7-a756-c8f674601710	berfin	$2b$12$meGMNRY1VhYY49g/L.RPgOyapPB0sm3Lr.niQ3chn1WPrcz23Nzii	t	f	\N	\N	\N	\N	2025-09-08 17:21:20.148358	klippers_level1	sub_1S58keGg0tCTvsYGMHO20dYj
562fc2f1-769d-45ad-9662-b02df1aa654b	berfin.agin+klippers221@gmail.com	8f104b70-cfa0-4bbf-9f63-428de242cfe2	berfin	$2b$12$2EevTj7/lkiFKaOtOkwlr.T7EepyPZdY09BpAHZShPi1mmquSk7IC	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
b1e7f067-b922-4015-aa19-d41b85a63941	berfin.agin+klippers222@gmail.com	7afe770a-f0f6-4cd1-98cd-28d3ca5d1e6b	berfin	$2b$12$LG/H4lvvF49hvkdCAcndRuV2gudrcCTNQy0thi6Mw03nxdcE71OCu	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
6705a8d6-55c9-4f9a-be71-dadcee33b445	berfin.agin+klippers223@gmail.com	d437583e-ef0a-4345-9ae6-09837ead7207	berfin	$2b$12$OY14vgoms7jP3yr.hKkYKObJ4uITGlhC0cPKwR.0CmX21n5T9hCRS	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
62fab4d8-9bb5-46f0-8bcf-974c4981f930	berfin.agin+klippers224@gmail.com	462f9ae0-7ffe-4512-812d-990703734a1e	berfin	$2b$12$KKkd3tTJEMGymbafN21LEehgYb/bI8aVJaaqDHm71D5eH.KuVcbYa	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
c1284c37-31c0-4350-ad20-54e90aa47c26	berfin.agin+klippers225@gmail.com	6561cf71-2258-4999-a8f5-e73bee860b5d	berfin	$2b$12$qQEoe8MUwzdkJiPkVnIBqOyIaQakBEe8Pnwb0tB0GvRRZ646RGSXO	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
d72c1444-ca01-4030-9f2e-7faebb951e90	berfin.agin+klippers226@gmail.com	47cc6fee-669e-49cc-ba28-fbc6c494cb13	berfin	$2b$12$/uhk4drDvmR8QfoMYfj2H.dsecgrnXlcXlBRc8oEVlrkCIy7zwhoG	t	f	\N	\N	\N	\N	\N	klippers_level1	\N
e7a6d2c8-22e8-40d2-ada1-01f20a4a1a29	berfin.aginnn@gmail.com	106568254401212752586	Berfin Agin	\N	t	f	\N	\N	\N	\N	\N	no_plan	\N
b14afa7b-23a8-4844-9f55-f3442520e02f	berfin.agin+cognito101@gmail.com	227594d4-60d1-70f2-863d-79fa9229ab4e	berfin agin	\N	t	f	{"name": "no_plan", "max_monthly_video_duration": 0, "max_monthly_video_count": 0, "max_monthly_video_count_per_user": 0, "max_monthly_video_count_per_user_per_week": 0, "max_monthly_video_count_per_user_per_month": 0, "max_monthly_video_count_per_user_per_year": 0}	\N	\N	\N	\N	no_plan	no_plan
c6875d74-37c8-4bc4-ba24-a298458b5c16	berfin.aginnn+cognito102@gmail.com	6275b414-c061-70ce-8048-c12ba5d9b728	berfin agin	\N	t	f	{"name": "no_plan", "max_monthly_video_duration": 0, "max_monthly_video_count": 0, "max_monthly_video_count_per_user": 0, "max_monthly_video_count_per_user_per_week": 0, "max_monthly_video_count_per_user_per_month": 0, "max_monthly_video_count_per_user_per_year": 0}	\N	\N	\N	\N	no_plan	no_plan
\.


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: klippersuser
--

SELECT pg_catalog.setval('public.groups_id_seq', 2, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: klippersuser
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: stripe_document_meters stripe_document_meters_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.stripe_document_meters
    ADD CONSTRAINT stripe_document_meters_pkey PRIMARY KEY (document_id);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (user_id, group_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: user_video_process_statuses user_video_process_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_video_process_statuses
    ADD CONSTRAINT user_video_process_statuses_pkey PRIMARY KEY (id);


--
-- Name: user_videos user_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_videos
    ADD CONSTRAINT user_videos_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_groups_id; Type: INDEX; Schema: public; Owner: klippersuser
--

CREATE INDEX ix_groups_id ON public.groups USING btree (id);


--
-- Name: ix_groups_name; Type: INDEX; Schema: public; Owner: klippersuser
--

CREATE UNIQUE INDEX ix_groups_name ON public.groups USING btree (name);


--
-- Name: ix_roles_id; Type: INDEX; Schema: public; Owner: klippersuser
--

CREATE INDEX ix_roles_id ON public.roles USING btree (id);


--
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: klippersuser
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: klippersuser
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: klippersuser
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: user_groups user_groups_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: user_groups user_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: klippersuser
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

