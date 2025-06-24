INSERT INTO `Service` VALUES
('cmbcanjyp00000dl8d06k7nka','Coupe',30,'coupe',1,'2025-05-31 15:55:18.479'),
('cmbcanmu900010dl8cyhw6v8i','Barbe',30,'barbe',1,'2025-05-31 15:55:18.491'),
('cmbcanpjm00020dl8gv8pcxk1','Coupe + Barbe',60,'coupe_barbe',1,'2025-05-31 15:55:18.493'),
('cmbcans6i00030dl8aybgf86x','Nattes',60,'nattes',1,'2025-05-31 15:55:18.497');

INSERT INTO `User` VALUES
('cm9o6sxpl0000ujzw0ytok1e4','Simon','Caudet','simon@mail.com','$2b$10$Hs2s7sjKrIbGtv981xWroelJ4.yhOZ4xTjsJhWbq0kf.5X7JS5XDq','0765046747','CLIENT',0,'ExponentPushToken[FhtbD6P565PT_KHT-bbRr9]','2025-04-19 12:21:07.113'),
('cm9smzyzo0000uj9cagnl5g7g','Rayan','raya','rayan@mail.com','$2a$10$Aq6M2A3iijmYyXQExU/p5u7w0rDLN8x/95/2BfJZT585xDCXv0pnW','+41791234567','BARBER',0,NULL,'2025-04-22 15:05:33.924'),
('cm9srzlu70000uj7kq0ou687t','Amir','Shehu','amir@mail.com','$2a$10$Aq6M2A3iijmYyXQExU/p5u7w0rDLN8x/95/2BfJZT585xDCXv0pnW','+41791230567','CLIENT',0,NULL,'2025-04-22 17:25:14.959'),
('cm9ss03vl0001uj7k217ilcuy','Thiams','thiti','thiams@mail.com','$2a$10$Aq6M2A3iijmYyXQExU/p5u7w0rDLN8x/95/2BfJZT585xDCXv0pnW','+42791230567','BARBER',0,NULL,'2025-04-22 17:25:38.337'),
('cmbjg6q730000uj1sms01pftk','alexis','Aragon','alexis@mail.com','$2b$10$51yA15MX8B5v1evjWQLB6uq8fR1VSNyC2voJUQbUVd.wgIpnuxbiC','+41765046747','CLIENT',0,NULL,'2025-06-05 14:04:20.895'),
('cmbl30n4v0000uja45f1dbog8','Aliyah','Okey','aliyah@mail.com','$2b$10$2EZ9/ytnrZ7ARpHgxFGCiOukPGUH.lG3Lz2Rd2KghlNfEqxnJWWDS','+41791234234','BARBER',0,NULL,'2025-06-06 17:31:14.336'),
('cmbur87270000uj680uyvf3p7','admin','admin','admin@mail.com','$2b$10$gT.6DukYAXcCnPOEEp/5WOIVB3065SI4V2oTdHjfKy.vNqZVJmdVC','+41791234204','ADMIN',0,'ExponentPushToken[FhtbD6P565PT_KHT-bbRr9]','2025-06-13 11:58:53.119'),
('cmbz7q5qr0000ujgg9gnldfu9','test','test','test@mail.com','$2b$10$QgTDZphTZBs073r58VNq9eFYFhxqmg6K0/AnqRjd9dFOoXNBGyBwG','0762541234','CLIENT',1,'ExponentPushToken[FhtbD6P565PT_KHT-bbRr9]','2025-06-16 14:51:49.780');


INSERT INTO `Guest` VALUES
('cmbwgiq800000uj2sgskg1fs1','Amir','079','2025-06-14 16:34:41.088'),
('cmbwgyvb20000ujqk4cmu7cdv','Léo','1234','2025-06-14 16:47:14.174'),
('cmbwgzc240003ujqkgpobzl1q','Léo','12345','2025-06-14 16:47:35.885'),
('cmbwgzfzc0006ujqk1x4jxmj0','Léo','12345','2025-06-14 16:47:40.968');

INSERT INTO `Salon` VALUES
('cmbh1zoqm00000dl16d31e7px','Lifestyle Barber Pont-Rouge','Place de Pont-Rouge 6','+41223139898','Lancy','lancy','2025-06-03 23:52:21.308');


INSERT INTO `Day` VALUES
('cmbl26miy000907l546kx3bsx','Friday'),
('cmbl26ctm000507l52nerc8wx','Monday'),
('cmbl26q81000a07l56wou755c','Saturday'),
('cmbl26tgl000b07l5g3fldbty','Sunday'),
('cmbl26k4t000807l5cnufbfxy','Thursday'),
('cmbl26fda000607l5dc8tg9g1','Tuesday'),
('cmbl26htq000707l5hs0w1rze','Wednesday');

INSERT INTO `Barber` VALUES
('cmbh21adq00000dl433nyflx8','cm9smzyzo0000uj9cagnl5g7g','cmbh1zoqm00000dl16d31e7px','rayan','Rayan','rayan','rayan','2025-06-03 23:53:07.371'),
('cmbl314hr00000diiadcqaagb','cmbl30n4v0000uja45f1dbog8','cmbh1zoqm00000dl16d31e7px','aliyah','Aliyah','aliyah','aliyah','2025-06-06 19:32:48.931'),
('cmbryvjh5000308jyc7u28t1h','cm9ss03vl0001uj7k217ilcuy','cmbh1zoqm00000dl16d31e7px','thiamss','Thiams','thiams','thiams','2025-06-11 15:10:13.420');

INSERT INTO `BarberBreak` VALUES
('cmbwhuxjn0003ujtcxcfw6ois','cmbh21adq00000dl433nyflx8','2025-06-14 00:00:00.000','17:00','17:30','2025-06-14 17:12:10.067'),
('okey','cmbl314hr00000diiadcqaagb','2025-06-14 00:00:00.000','09:00','13:00','2025-06-13 19:18:46.126');

INSERT INTO `BarberDay` VALUES
('cmbl2dq1j000e07l517p79ixk','cmbh21adq00000dl433nyflx8','cmbl26ctm000507l52nerc8wx',0),
('cmbl2dscz000f07l5el3s8rs7','cmbh21adq00000dl433nyflx8','cmbl26fda000607l5dc8tg9g1',1),
('cmbl2dukd000g07l54q11axyf','cmbh21adq00000dl433nyflx8','cmbl26htq000707l5hs0w1rze',1),
('cmbl2dx7y000h07l52j2e94op','cmbh21adq00000dl433nyflx8','cmbl26k4t000807l5cnufbfxy',1),
('cmbl2dzn4000i07l56348gup0','cmbh21adq00000dl433nyflx8','cmbl26miy000907l546kx3bsx',1),
('cmbl2e1z4000j07l55ha83av1','cmbh21adq00000dl433nyflx8','cmbl26q81000a07l56wou755c',1),
('cmbl2e476000k07l5gb3j40rb','cmbh21adq00000dl433nyflx8','cmbl26tgl000b07l5g3fldbty',0),
('cmbl33una00020dii2kqc2i83','cmbl314hr00000diiadcqaagb','cmbl26ctm000507l52nerc8wx',0),
('cmbl33wuf00030dii5gkj4bdh','cmbl314hr00000diiadcqaagb','cmbl26fda000607l5dc8tg9g1',1),
('cmbl33yus00040diid2m914ku','cmbl314hr00000diiadcqaagb','cmbl26htq000707l5hs0w1rze',1),
('cmbl340pu00050diibsind2va','cmbl314hr00000diiadcqaagb','cmbl26k4t000807l5cnufbfxy',1),
('cmbl342nd00060diifu6m37bi','cmbl314hr00000diiadcqaagb','cmbl26miy000907l546kx3bsx',1),
('cmbl344kt00070diieyua67nn','cmbl314hr00000diiadcqaagb','cmbl26q81000a07l56wou755c',1),
('cmbl35f0v00080diiedazbk0f','cmbl314hr00000diiadcqaagb','cmbl26tgl000b07l5g3fldbty',0),
('cmbryyq7m000608jy6by489fa','cmbryvjh5000308jyc7u28t1h','cmbl26ctm000507l52nerc8wx',0),
('cmbrz0ylc000708jyfgqnc61y','cmbryvjh5000308jyc7u28t1h','cmbl26fda000607l5dc8tg9g1',1),
('cmbrz1167000808jyclsuayfc','cmbryvjh5000308jyc7u28t1h','cmbl26htq000707l5hs0w1rze',1),
('cmbrz13t2000908jy579l3r0l','cmbryvjh5000308jyc7u28t1h','cmbl26k4t000807l5cnufbfxy',1),
('cmbrz169p000a08jy43oq6193','cmbryvjh5000308jyc7u28t1h','cmbl26miy000907l546kx3bsx',1),
('cmbrz19s8000b08jy42yo0gkw','cmbryvjh5000308jyc7u28t1h','cmbl26q81000a07l56wou755c',1),
('cmbrz1ca7000c08jycgnq78i6','cmbryvjh5000308jyc7u28t1h','cmbl26tgl000b07l5g3fldbty',0);

INSERT INTO `BarberService` VALUES
('cmbh2l81o00060dl43ab06k41','cmbh21adq00000dl433nyflx8','cmbcanjyp00000dl8d06k7nka',45,40),
('cmbh2lb1i00070dl4h1zl2jie','cmbh21adq00000dl433nyflx8','cmbcanmu900010dl8cyhw6v8i',25,20),
('cmbh2ldv400080dl4172hefps','cmbh21adq00000dl433nyflx8','cmbcanpjm00020dl8gv8pcxk1',55,50),
('cmbl333gs00010diigmxe11ud','cmbl314hr00000diiadcqaagb','cmbcans6i00030dl8aybgf86x',60,55),
('cmbryyjyu000408jyc6as15ea','cmbryvjh5000308jyc7u28t1h','cmbcanjyp00000dl8d06k7nka',35,30),
('cmbryynh4000508jy9fc0e7ip','cmbryvjh5000308jyc7u28t1h','cmbcanmu900010dl8cyhw6v8i',25,20),
('cmbryyq7m000608jy6by489fa','cmbryvjh5000308jyc7u28t1h','cmbcanpjm00020dl8gv8pcxk1',55,50);



INSERT INTO `SalonDay` VALUES
('cmbl25etq000007l5gxftft0l','cmbh1zoqm00000dl16d31e7px','cmbl26ctm000507l52nerc8wx','09:00','19:00',0),
('cmbl25hkw000107l5gsj24bb1','cmbh1zoqm00000dl16d31e7px','cmbl26fda000607l5dc8tg9g1','09:00','19:00',1),
('cmbl25jkr000207l56jzc3dki','cmbh1zoqm00000dl16d31e7px','cmbl26htq000707l5hs0w1rze','09:00','19:00',1),
('cmbl25lv3000307l51hst5s7y','cmbh1zoqm00000dl16d31e7px','cmbl26k4t000807l5cnufbfxy','09:00','20:00',1),
('cmbl25o88000407l5gmv66x9q','cmbh1zoqm00000dl16d31e7px','cmbl26miy000907l546kx3bsx','09:00','20:00',1),
('cmbl2bn1o000c07l5f9608272','cmbh1zoqm00000dl16d31e7px','cmbl26q81000a07l56wou755c','09:00','18:00',1),
('cmbl2bpuk000d07l53ikleo6h','cmbh1zoqm00000dl16d31e7px','cmbl26tgl000b07l5g3fldbty','09:00','17:00',0);


INSERT INTO `Appointment` VALUES
('cmbl3ofdj000107k05fp46no1','cm9o6sxpl0000ujzw0ytok1e4',NULL,'cmbh21adq00000dl433nyflx8','cmbcanjyp00000dl8d06k7nka','2025-06-11 00:00:00.000','12:00','13:00'),
('cmbs2ltrt000bujt88hd7wqwk','cm9o6sxpl0000ujzw0ytok1e4',NULL,'cmbl314hr00000diiadcqaagb','cmbcans6i00030dl8aybgf86x','2025-06-14 00:00:00.000','13:30','14:30'),
('cmbs34geh0001ujpko0phyjll','cm9o6sxpl0000ujzw0ytok1e4',NULL,'cmbryvjh5000308jyc7u28t1h','cmbcanjyp00000dl8d06k7nka','2025-06-11 00:00:00.000','09:00','09:30'),
('cmbs4q9fj0001ujo0zeitru7k','cm9o6sxpl0000ujzw0ytok1e4',NULL,'cmbh21adq00000dl433nyflx8','cmbcanjyp00000dl8d06k7nka','2025-06-12 00:00:00.000','12:00','12:30'),
('cmbuscmpa0001ujhg9p1w85fj','cm9o6sxpl0000ujzw0ytok1e4',NULL,'cmbh21adq00000dl433nyflx8','cmbcanjyp00000dl8d06k7nka','2025-06-14 00:00:00.000','10:00','10:30'),
('cmbwgiq870002uj2susyh6os4',NULL,'cmbwgiq800000uj2sgskg1fs1','cmbryvjh5000308jyc7u28t1h','cmbcanpjm00020dl8gv8pcxk1','2025-06-14 00:00:00.000','12:00','13:00'),
('cmbwgyvb90002ujqk18ssgzs9',NULL,'cmbwgyvb20000ujqk4cmu7cdv','cmbryvjh5000308jyc7u28t1h','cmbcanjyp00000dl8d06k7nka','2025-06-14 00:00:00.000','14:30','15:00'),
('cmbwgzfzp0008ujqktgz40g9q',NULL,'cmbwgzfzc0006ujqk1x4jxmj0','cmbl314hr00000diiadcqaagb','cmbcans6i00030dl8aybgf86x','2025-06-14 00:00:00.000','15:00','16:00'),
('cmbz7qlrw0002ujggfx0mngwu','cmbz7q5qr0000ujgg9gnldfu9',NULL,'cmbh21adq00000dl433nyflx8','cmbcanjyp00000dl8d06k7nka','2025-06-17 00:00:00.000','09:30','10:00'),
('cmbz7suhy0001ujl4sqyceiei','cmbz7q5qr0000ujgg9gnldfu9',NULL,'cmbh21adq00000dl433nyflx8','cmbcanjyp00000dl8d06k7nka','2025-06-17 00:00:00.000','10:00','10:30');
