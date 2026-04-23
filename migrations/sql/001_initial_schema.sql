--
-- PostgreSQL database dump
--


-- Dumped from database version 17.8 (130b160)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

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
-- Name: interviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interviews (
    position_id integer NOT NULL,
    scheduled timestamp with time zone NOT NULL,
    duration interval,
    location character varying,
    meeting_link character varying(2000),
    label character varying(100) NOT NULL
);


ALTER TABLE public.interviews OWNER TO neondb_owner;

--
-- Name: links; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.links (
    position_id integer NOT NULL,
    label character varying(100) NOT NULL,
    url character varying(2000) NOT NULL,
    sort_order smallint NOT NULL
);


ALTER TABLE public.links OWNER TO neondb_owner;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.positions (
    user_id integer NOT NULL,
    id integer NOT NULL,
    company character varying(100) NOT NULL,
    title character varying(100) NOT NULL,
    status_id integer NOT NULL,
    date_applied date,
    travel_minutes smallint,
    notes character varying
);


ALTER TABLE public.positions OWNER TO neondb_owner;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

ALTER TABLE public.positions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: statuses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.statuses (
    id integer NOT NULL,
    name character varying(15)
);


ALTER TABLE public.statuses OWNER TO neondb_owner;

--
-- Name: statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

ALTER TABLE public.statuses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(60) NOT NULL,
    password character(60) NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: links constraint_unique_sort; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT constraint_unique_sort UNIQUE (position_id, sort_order);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (position_id, scheduled);


--
-- Name: links links_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (position_id, label);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: statuses statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT statuses_name_key UNIQUE (name);


--
-- Name: statuses statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id);


--
-- Name: users users_id; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id UNIQUE (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: index_user_position; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX index_user_position ON public.positions USING btree (user_id, id);


--
-- Name: interviews constraint_interviews_positions; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT constraint_interviews_positions FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: links constraint_links_positions; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT constraint_links_positions FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: positions constraint_positions_statuses; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT constraint_positions_statuses FOREIGN KEY (status_id) REFERENCES public.statuses(id);


--
-- Name: positions constraint_positions_users; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT constraint_positions_users FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.8 (a48d9ca)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

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
-- Data for Name: statuses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.statuses (id, name) FROM stdin;
1	Not Applied
2	Applied
3	Interviewing
5	Offered
4	Rejected
\.


--
-- Name: statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.statuses_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

