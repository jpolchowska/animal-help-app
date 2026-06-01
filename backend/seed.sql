--
-- PostgreSQL database dump
--

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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
-- Data for Name: animals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.animals VALUES (17, 'Piorun', 'pies', 'Do adopcji', '/images/1769977978870.jpg', 'ok. 3 lata', 'Samiec', 'Piorun uwielbia długie spacery i zabawy z piłką. Szybko przywiązuje się do opiekuna i świetnie dogaduje się z dziećmi.', '["Energiczny","Towarzyski","Wesoły"]');
INSERT INTO public.animals VALUES (18, 'Mruczek', 'kot', 'Zaadoptowane', '/images/1769978022863.PNG', 'ok. 5 lat', 'Samiec', 'Mruczek uwielbia drzemki na słonecznym parapecie. Idealny towarzysz dla osób ceniących ciszę i domowy spokój.', '["Spokojny","Niezależny","Delikatny"]');
INSERT INTO public.animals VALUES (19, 'Stokrotka', 'pies', 'Do adopcji', '/images/1769978176954.JPG', 'ok. 2 lata', 'Samica', 'Stokrotka szuka czułego i spokojnego domu. Lubi spacery po parku i wieczorne przytulanie na kanapie.', '["Łagodny","Czuły","Delikatny"]');
INSERT INTO public.animals VALUES (20, 'Perełka', 'pies', 'W trakcie leczenia', '/images/1769978201175.JPG', 'ok. 4 lata', 'Samica', 'Perełka jest w trakcie rehabilitacji po urazie łapy, ale zachowuje pogodne usposobienie i chętnie nawiązuje kontakt.', '["Przyjazny","Łagodny","Spokojny"]');
INSERT INTO public.animals VALUES (21, 'Puszek', 'kot', 'W trakcie leczenia', '/images/1769978272551.JPG', 'ok. 1 rok', 'Samiec', 'Puszek bada każdy zakamarek domu z ciekawością. Uwielbia zabawki z piórkami i głośne mruczenie przy głaskaniu.', '["Ciekawy","Energiczny","Wesoły"]');
INSERT INTO public.animals VALUES (22, 'Kora', 'pies', 'W trakcie leczenia', '/images/1769978300375.jpeg', 'ok. 6 lat', 'Samica', 'Kora od lat przebywa w schronisku, ale nigdy nie straciła ufności wobec ludzi. Ma duże serce i czeka na swój dom.', '["Łagodny","Towarzyski","Czuły"]');
INSERT INTO public.animals VALUES (23, 'Karmel', 'pies', 'W trakcie leczenia', '/images/1769978337688.JPG', 'ok. 3 lata', 'Samiec', 'Karmel jest spokojny i czuły. Nie wymaga intensywnych ćwiczeń — ceni codzienne rytuały i stały dom pełen ciepła.', '["Spokojny","Czuły","Delikatny"]');
INSERT INTO public.animals VALUES (24, 'Nutka', 'kot', 'Do adopcji', '/images/1769978407261.JPG', 'ok. 2 lata', 'Samica', 'Nutka zaczyna mruczeć, gdy tylko poczuje się bezpiecznie. Po krótkim czasie aklimatyzacji staje się oddaną i wierną towarzyszką.', '["Spokojny","Delikatny","Niezależny"]');
INSERT INTO public.animals VALUES (25, 'Tobi', 'pies', 'Do adopcji', '/images/1769978453658.JPG', 'ok. 5 lat', 'Samiec', 'Tobi uwielbia aportowanie i naukę sztuczek. Szybko się uczy i potrzebuje regularnych wyzwań umysłowych oraz długich wybiegów.', '["Aktywny","Energiczny","Towarzyski"]');
INSERT INTO public.animals VALUES (26, 'Daisy', 'kot', 'W trakcie leczenia', '/images/1769978476779.WEBP', 'ok. 7 lat', 'Samica', 'Daisy to dojrzała kotka o spokojnym i statecznym charakterze. Preferuje ciche domostwo bez innych zwierząt.', '["Spokojny","Niezależny","Delikatny"]');
INSERT INTO public.animals VALUES (27, 'Lara', 'pies', 'Do adopcji', '/images/1769978527609.WEBP', 'ok. 2 lata', 'Samica', 'Lara pała entuzjazmem przy każdym spotkaniu z człowiekiem. Świetnie sprawdza się w domu z dziećmi i innymi psami.', '["Towarzyski","Radosny","Przyjazny"]');
INSERT INTO public.animals VALUES (28, 'Nasa', 'pies', 'W trakcie leczenia', '/images/1769978583939.JPG', 'ok. 4 lata', 'Samica', 'Nasa jest bystra i spostrzegawcza. Lubi obserwować otoczenie i eksplorować nowe miejsca podczas każdego spaceru.', '["Aktywny","Ciekawy","Łagodny"]');
INSERT INTO public.animals VALUES (29, 'Oskar', 'pies', 'W trakcie leczenia', '/images/1769978723115.WEBP', 'ok. 8 lat', 'Samiec', 'Oskar szuka spokojnego domu na emeryturę. Kocha długie drzemki i spacery we własnym, leniwym tempie.', '["Spokojny","Łagodny","Czuły"]');
INSERT INTO public.animals VALUES (30, 'Gapa', 'pies', 'Do adopcji', '/images/1769978835461.WEBP', 'ok. 1 rok', 'Samica', 'Gapa to pełna energii młoda psinka, która dopiero uczy się świata. Potrzebuje cierpliwego opiekuna i mnóstwo miłości.', '["Energiczny","Ciekawy","Wesoły"]');
INSERT INTO public.animals VALUES (32, 'Luta', 'pies', 'Do adopcji', '/images/1769978984501.JPG', 'ok. 3 lata', 'Samica', 'Luta ma mocny charakter i dobrze dogaduje się z innymi psami. Chętnie biega na ogrodzonym terenie i uwielbia ruch.', '["Towarzyski","Aktywny","Radosny"]');
INSERT INTO public.animals VALUES (33, 'Daisy', 'pies', 'W trakcie leczenia', '/images/1769979030084.JPG', 'ok. 5 lat', 'Samica', 'Daisy ma złote serce. Choć jest w trakcie leczenia, nie traci optymizmu i cieszy się z każdej wizyty w schronisku.', '["Wesoły","Przyjazny","Łagodny"]');
INSERT INTO public.animals VALUES (34, 'Burek', 'pies', 'W trakcie leczenia', '/images/1769979245412.JPG', 'ok. 7 lat', 'Samiec', 'Burek to spokojny i oddany pies bez fanaberii. Marzy o własnym ogródku i lojalnym opiekunie, który zapewni mu poczucie bezpieczeństwa.', '["Spokojny","Łagodny","Czuły"]');
INSERT INTO public.animals VALUES (35, 'Pimpuś', 'pies', 'Zaadoptowane', '/images/1769979275568.JPG', 'ok. 2 lata', 'Samiec', 'Pimpuś uwielbiał wyć do muzyki i bawić się z dziećmi. Trafił już do nowego, szczęśliwego domu.', '["Energiczny","Wesoły","Towarzyski"]');
INSERT INTO public.animals VALUES (36, 'Ansi', 'pies', 'Zaadoptowane', '/images/1769979311878.WEBP', 'ok. 4 lata', 'Samiec', 'Ansi jest żywiołowy i czuły. Podbił serce swojej nowej rodziny już podczas pierwszego spotkania w schronisku.', '["Towarzyski","Czuły","Radosny"]');
INSERT INTO public.animals VALUES (37, 'Warcuś', 'pies', 'Zaadoptowane', '/images/1769979377940.WEBP', 'ok. 6 lat', 'Samiec', 'Warcuś miał trudny start, ale w schronisku odzyskał zaufanie do ludzi. Teraz cieszy się ciepłym domem i kochającą rodziną.', '["Łagodny","Spokojny","Przyjazny"]');
INSERT INTO public.animals VALUES (49, 'Nuta', 'pies', 'Do adopcji', '/images/1770635088702.jpeg', 'ok. 1 rok', 'Samica', 'Nuta potrzebuje spokojnego domu z cierpliwym opiekunem. W komfortowym otoczeniu staje się niezwykle czuła i oddana.', '["Delikatny","Czuły","Nieśmiały"]');
INSERT INTO public.animals VALUES (50, 'Kulka', 'kot', 'W trakcie leczenia', '/images/1770635216295.jpeg', 'ok. 3 lata', 'Samica', 'Kulka uwielbia drzemki na kolanach i głośne mruczenie na dobranoc. Idealna kotka dla każdego spokojnego domu.', '["Spokojny","Czuły","Delikatny"]');
INSERT INTO public.animals VALUES (52, 'Myszka', 'pies', 'W trakcie leczenia', '/images/1770635292717.jpeg', 'ok. 2 lata', 'Samica', 'Myszka jest niepozorna, ale pełna odwagi. Z radością eksploruje każde nowe miejsce i nie boi się żadnej przygody.', '["Aktywny","Ciekawy","Radosny"]');
INSERT INTO public.animals VALUES (53, 'Gryzak', 'pies', 'W trakcie leczenia', '/images/1770635332914.jpeg', 'ok. 5 lat', 'Samiec', 'Gryzak przeszedł długą drogę do oswojenia. Teraz czeka na kogoś, kto da mu szansę na nowy, lepszy rozdział życia.', '["Energiczny","Aktywny","Ciekawy"]');
INSERT INTO public.animals VALUES (54, 'Sam', 'pies', 'W trakcie leczenia', '/images/1770635556116.jpeg', 'ok. 4 lata', 'Samiec', 'Sam jest spokojny i niezwykle lojalny. Jeden z tych, co przywiązuje się raz i na zawsze.', '["Spokojny","Łagodny","Czuły"]');
INSERT INTO public.animals VALUES (55, 'Sam', 'pies', 'Do adopcji', '/images/1770635866057.jpeg', 'ok. 2 lata', 'Samiec', 'Ten Sam to energiczny i ciekawski pies, zawsze gotowy do zabawy. Szuka domu z dużą przestrzenią i dobrym towarzystwem.', '["Energiczny","Towarzyski","Wesoły"]');
INSERT INTO public.animals VALUES (58, 'Szafirek', 'pies', 'Do adopcji', '/images/1770636103507.WEBP', 'ok. 1 rok', 'Samiec', 'Szafirek jest pełen energii i ciekawości. Ma żywy temperament i zawsze ma plan na nową przygodę.', '["Energiczny","Ciekawy","Towarzyski"]');
INSERT INTO public.animals VALUES (61, 'Moli', 'pies', 'Do adopcji', '/images/1770636454201.WEBP', 'ok. 2 lata', 'Samica', 'Moli szuka domu pełnego spokoju i ciepła. Kocha się wtulać i być blisko człowieka przez cały dzień.', '["Łagodny","Czuły","Delikatny"]');
INSERT INTO public.animals VALUES (65, 'Odiś', 'kot', 'Do adopcji', '/images/1770637087799.WEBP', 'ok. 2 lata', 'Samiec', 'Odiś to niespokojny odkrywca. Potrzebuje przestrzeni do eksploracji i zabawek, które zajmą jego bystry i aktywny umysł.', '["Ciekawy","Energiczny","Aktywny"]');
INSERT INTO public.animals VALUES (68, 'Molly', 'kot', 'Zaadoptowane', '/images/1770637509291.WEBP', 'ok. 1 rok', 'Samica', 'Molly od razu wiedziała, że jej nowy dom jest właśnie tym, czego szukała. Teraz cieszy się nowym życiem.', '["Czuły","Wesoły","Towarzyski"]');
INSERT INTO public.animals VALUES (56, 'Aurelia', 'kot', 'Do adopcji', '/images/1770635891060.WEBP', 'ok. 8 lat', 'Samica', 'Aurelia to elegancka kotka z charakterem. Sama decyduje, kiedy chce być głaskana — i robi to z królewską gracją.', '["Niezależny","Delikatny","Spokojny"]');
INSERT INTO public.animals VALUES (57, 'Zara', 'pies', 'Do adopcji', '/images/1770635940428.WEBP', 'ok. 3 lata', 'Samica', 'Zara jest spokojna i zrównoważona, idealna dla rodzin z dziećmi. Lubi stały rytm dnia i przewidywalne otoczenie.', '["Spokojny","Łagodny","Przyjazny"]');
INSERT INTO public.animals VALUES (59, 'Tango', 'pies', 'Do adopcji', '/images/1770636226759.WEBP', 'ok. 4 lata', 'Samiec', 'Tango kocha ruch i bieganie. Idealny towarzysz dla aktywnych właścicieli z dostępem do parku lub ogrodu.', '["Aktywny","Radosny","Wesoły"]');
INSERT INTO public.animals VALUES (60, 'Heidi', 'pies', 'Zaadoptowane', '/images/1770636367531.WEBP', 'ok. 6 lat', 'Samica', 'Heidi od razu podbiła serce swojej nowej rodziny. Teraz cieszy się zasłużonym szczęściem w nowym domu.', '["Wesoły","Towarzyski","Radosny"]');
INSERT INTO public.animals VALUES (62, 'Salma', 'pies', 'Do adopcji', '/images/1770636667958.WEBP', 'ok. 3 lata', 'Samica', 'Salma jest pewna siebie i aktywna. Potrzebuje konsekwentnego opiekuna z doświadczeniem i dużo codziennego ruchu na świeżym powietrzu.', '["Aktywny","Energiczny","Towarzyski"]');
INSERT INTO public.animals VALUES (63, 'Aston', 'pies', 'Zaadoptowane', '/images/1770636743142.WEBP', 'ok. 5 lat', 'Samiec', 'Aston ma łagodne i szlachetne usposobienie. Piękna sierść i spokojny charakter sprawiły, że szybko znalazł nowy, kochający dom.', '["Łagodny","Towarzyski","Spokojny"]');
INSERT INTO public.animals VALUES (64, 'Isza', 'kot', 'Do adopcji', '/images/1770636974902.WEBP', 'ok. 4 lata', 'Samica', 'Isza otwiera się na swoich warunkach i we własnym tempie. Gdy zaufanie jest zbudowane, staje się oddaną i wierną towarzyszką.', '["Niezależny","Ciekawy","Delikatny"]');
INSERT INTO public.animals VALUES (66, 'Śnieżka', 'kot', 'W trakcie leczenia', '/images/1770637378883.WEBP', 'ok. 6 lat', 'Samica', 'Śnieżka jest w trakcie leczenia, ale nie traci pogody ducha. Przyjmuje każdą pieszczotę z wdzięcznością.', '["Delikatny","Spokojny","Czuły"]');
INSERT INTO public.animals VALUES (67, 'Mizu', 'pies', 'Do adopcji', '/images/1770637429883.WEBP', 'ok. 3 lata', 'Samiec', 'Mizu jest spokojny i zrównoważony — jego obecność działa uspokajająco na cały dom. Ideał dla kogoś szukającego cichego towarzysza.', '["Spokojny","Łagodny","Delikatny"]');
INSERT INTO public.animals VALUES (69, 'Ginger', 'pies', 'Do adopcji', '/images/1770637533110.WEBP', 'ok. 4 lata', 'Samiec', 'Ginger uwielbia biegać na wolnym powietrzu i spać przy nodze opiekuna po długim dniu. Ma energię i złote serce.', '["Energiczny","Aktywny","Radosny"]');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (3, 'john.doe@gmail.com', '$2b$10$2Ouq67mZGnp2nnwshbyJ7eh7oAYTGAQS1bMjSza5zqni/AnVe1m5u', 'user', 'John', '2026-01-31 12:44:03+00', '2026-01-31 12:44:17+00');
INSERT INTO public.users VALUES (4, 'vera@gmail.com', '$2b$10$oDtgweRzwYsw.iBMbDnP/ejecpHFf6YCFcXX2zSfC6CV9zy8BgoLi', 'user', 'VrushKa', '2026-02-02 15:45:20+00', '2026-02-09 23:11:03+00');
INSERT INTO public.users VALUES (5, 'katarzyna.polchowska@gmail.com', '$2b$10$a.BiE7P3K/5nW04m057ebut.WULtOQGm/23FjZd6NPRho75IMdMDG', 'user', 'Katarzyna', '2026-02-02 15:48:53+00', '2026-02-03 05:09:54+00');
INSERT INTO public.users VALUES (6, 'maja@gmail.com', '$2b$10$VpiEzUn/ePEyFhGB2Z0RBuuodqiEyZ6Ui74TpZ9oXxUYeyjXh1pBO', 'volunteer', 'Maja', '2026-02-03 06:24:52+00', '2026-02-09 23:12:18+00');
INSERT INTO public.users VALUES (7, 'test@gmail.com', '$2b$10$MlnFWkRNP5fIrYIoNHa1FOrSP/Htin48bDh45.fOUeEYo6w5xG86S', 'volunteer', 'Test', '2026-02-03 18:00:06+00', '2026-02-03 18:00:22+00');
INSERT INTO public.users VALUES (8, 'user@gmail.com', '$2b$10$QpeI/o.57MqOCCVhAvJUSePQhYDU2xM92qmaD.5Xy5HsxzGenkrdu', 'user', 'User', '2026-02-03 18:08:51+00', '2026-02-03 18:09:03+00');
INSERT INTO public.users VALUES (9, 'jan.kowalski@gmail.com', '$2b$10$w6sStTFzmuyBQkxQ5qr8DOU7ADOR0ncwY7h6e0lbl0nfYAg6ZSopu', 'volunteer', 'Jan', '2026-02-03 18:15:41+00', '2026-02-03 18:15:49+00');
INSERT INTO public.users VALUES (10, 'anna@gmail.com', '$2b$10$60sxOinlmSlMnal6/DEj3ukJOYG4nEWodv6VJMROCzYPeM1vE48zG', 'volunteer', 'Anna', '2026-02-03 20:00:44+00', '2026-02-03 20:00:53+00');
INSERT INTO public.users VALUES (11, 'person@gmail.com', '$2b$10$owpoiS8KjfRsk00FqygfOemm59ETA/WUroIjLijjM6lAEvxcFkvCi', 'user', 'Person', '2026-02-04 04:50:53+00', '2026-02-04 04:51:19+00');
INSERT INTO public.users VALUES (12, 'u@gmail.com', '$2b$10$tYDcmIaIQMNeqrnuhahgXeBImWw08g57B33smNPytSETVH6nx2Lh6', 'volunteer', 'U', '2026-02-04 09:23:35+00', '2026-02-04 09:23:49+00');
INSERT INTO public.users VALUES (13, 'maja.polchowska@gmail.com', '$2b$10$GY/Mg8tiNSOHgebsa/EWY.Ycee9pJ5P8ffBiVHw0Mz2Bl.LUAdW7a', 'volunteer', 'Maja', '2026-02-04 12:56:01+00', '2026-02-04 13:04:16+00');
INSERT INTO public.users VALUES (14, 'anna.nowak@gmail.com', '$2b$10$bvvDzoYr2OicVwr47ns.CukfAbQNALMUelUezzSgUb.ubLvxsSac6', 'user', 'Anna', '2026-02-07 13:30:58+00', '2026-02-07 13:31:08+00');
INSERT INTO public.users VALUES (15, 'jane.doe@gmail.com', '$2b$10$3g8KJ3FAZMDiNI.DzHEEv.XQZbED0pzG81GnkQf25E1C10E194.Vm', 'volunteer', 'Jane', '2026-02-09 19:33:05+00', '2026-02-10 12:51:00+00');
INSERT INTO public.users VALUES (16, 'acc@gmail.com', '$2b$10$4.GcJpXSz1splMnlTZA9J.obDLrhGjAe781tCRedtofAOwrnNLLWm', 'user', 'acc1', '2026-02-16 15:03:12+00', NULL);
INSERT INTO public.users VALUES (17, '1@1', '$2b$10$asise2rWm5i13J/I2m49NeC65NSBAYgCL4AIHhG.vmRUWZcP18heq', 'user', '1', '2026-02-16 15:04:50+00', '2026-02-16 15:04:56+00');
INSERT INTO public.users VALUES (18, 'acc2@gmail.com', '$2b$10$hQ59tQDBNOxmtO3PH/pOj.Pdwtw.JPnsiXUrQ7epm5Clg9NZDJNRi', 'volunteer', 'acc2', '2026-02-16 18:18:03+00', '2026-02-16 18:18:17+00');
INSERT INTO public.users VALUES (1, 'admin@gmail.com', '$2b$10$jKO8dnqkUBVxWFr/R8GiUO.f/k0Y1gm4omcTm/WGP6EqlYLGj0tUO', 'admin', 'Admin', '2026-01-27 21:20:38+00', '2026-05-30 19:20:59.315983+00');
INSERT INTO public.users VALUES (2, 'jagoda.polchowska@gmail.com', '$2b$10$WcXTxl5MXjSKjix6LwYVP.1.JWZy/ycPVcUdiynCeCSj8IzVfl0SS', 'volunteer', 'Jagoda', '2026-01-29 14:05:30+00', '2026-05-30 19:21:11.694429+00');


--
-- Data for Name: adoptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.adoptions VALUES (5, 13, 35, 'Zaakceptowany', '2026-02-04 12:59:01+00');
INSERT INTO public.adoptions VALUES (6, 2, 68, 'Zaakceptowany', '2026-02-09 18:03:36+00');
INSERT INTO public.adoptions VALUES (7, 15, 60, 'Odrzucony', '2026-02-09 20:12:35+00');
INSERT INTO public.adoptions VALUES (8, 15, 60, 'Zaakceptowany', '2026-02-09 21:55:52+00');
INSERT INTO public.adoptions VALUES (9, 15, 69, 'Odrzucony', '2026-02-09 22:54:12+00');
INSERT INTO public.adoptions VALUES (10, 15, 67, 'W oczekiwaniu', '2026-02-09 23:08:21+00');
INSERT INTO public.adoptions VALUES (11, 6, 63, 'Zaakceptowany', '2026-02-09 23:12:50+00');
INSERT INTO public.adoptions VALUES (13, 2, 64, 'W oczekiwaniu', '2026-05-30 09:41:37+00');


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tasks VALUES (11, 'Karmienie zwierząt', 'Nakarmienie zwierząt rano i wieczorem', '2026-05-31', '08:00', '20:00');
INSERT INTO public.tasks VALUES (12, 'Spacer z psem', 'Spacer z dowolnym psem', '2026-06-01', '12:00', '16:00');


--
-- Data for Name: signups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.signups VALUES (3, 12, 2, '');


--
-- Name: adoptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adoptions_id_seq', 14, true);


--
-- Name: animals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.animals_id_seq', 70, false);


--
-- Name: signups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.signups_id_seq', 3, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 19, false);


--
-- PostgreSQL database dump complete
--


