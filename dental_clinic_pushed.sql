-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dental_clinic
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agent_events`
--

DROP TABLE IF EXISTS `agent_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload_json` longtext COLLATE utf8mb4_unicode_ci,
  `status` enum('NEW','PROCESSING','DONE','FAILED','DEAD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `priority` int NOT NULL DEFAULT '50',
  `attempts` int NOT NULL DEFAULT '0',
  `max_attempts` int NOT NULL DEFAULT '5',
  `available_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `locked_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locked_until` datetime DEFAULT NULL,
  `correlation_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by_user_id` bigint unsigned DEFAULT NULL,
  `last_error` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_available` (`status`,`available_at`,`priority`,`id`),
  KEY `idx_locked_by` (`locked_by`),
  KEY `idx_correlation` (`correlation_id`),
  KEY `idx_event_type` (`event_type`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_events`
--

LOCK TABLES `agent_events` WRITE;
/*!40000 ALTER TABLE `agent_events` DISABLE KEYS */;
INSERT INTO `agent_events` VALUES (1,'AppointmentMonitorTick','{}','NEW',50,0,5,'2026-05-09 15:25:23',NULL,NULL,NULL,NULL,NULL,'2026-05-09 15:25:23','2026-05-09 15:25:23'),(2,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-05-09T09:55:46.476Z\"}}','NEW',50,0,5,'2026-05-09 15:25:46',NULL,NULL,NULL,NULL,NULL,'2026-05-09 15:25:46','2026-05-09 15:25:46'),(3,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-07T12:16:16.379Z\"}}','NEW',50,0,5,'2026-08-07 17:46:16',NULL,NULL,NULL,NULL,NULL,'2026-08-07 17:46:16','2026-08-07 17:46:16'),(4,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-07T12:32:49.369Z\"}}','NEW',50,0,5,'2026-08-07 18:02:49',NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:02:49','2026-08-07 18:02:49'),(5,'CaseUpdated','{\"caseDbId\":1,\"stage\":\"WAITING_ON_PATIENT\",\"nextAction\":\"Case created\",\"__meta\":{\"createdByUserId\":1,\"createdAt\":\"2026-08-07T12:42:55.196Z\"}}','NEW',50,0,5,'2026-08-07 18:12:55',NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:12:55','2026-08-07 18:12:55'),(6,'CaseGenerateSummary','{\"caseId\": 1, \"source\": \"doctor_ui\", \"caseDbId\": 1}','NEW',50,0,5,'2026-08-07 18:13:00',NULL,NULL,NULL,1,NULL,'2026-08-07 18:13:00','2026-08-07 18:13:00'),(7,'CaseGenerateSummary','{\"caseId\": 1, \"source\": \"doctor_ui\", \"caseDbId\": 1}','NEW',50,0,5,'2026-08-07 18:13:33',NULL,NULL,NULL,1,NULL,'2026-08-07 18:13:33','2026-08-07 18:13:33'),(8,'CaseGenerateSummary','{\"caseId\": 1, \"source\": \"doctor_ui\", \"caseDbId\": 1}','NEW',50,0,5,'2026-08-07 18:21:03',NULL,NULL,NULL,1,NULL,'2026-08-07 18:21:03','2026-08-07 18:21:03'),(9,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T08:14:41.329Z\"}}','NEW',50,0,5,'2026-08-08 13:44:41',NULL,NULL,NULL,NULL,NULL,'2026-08-08 13:44:41','2026-08-08 13:44:41'),(10,'AppointmentCreated','{\"appointmentId\":13,\"appointmentUid\":\"APT-1786179723441\",\"patientId\":20,\"doctorId\":9,\"date\":\"2026-08-08\",\"time\":\"14:35:00\",\"type\":\"New patient consultation\",\"operatoryId\":null,\"__meta\":{\"createdByUserId\":28,\"createdAt\":\"2026-08-08T09:02:03.452Z\"}}','NEW',50,0,5,'2026-08-08 14:32:03',NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:32:03','2026-08-08 14:32:03'),(11,'CaseGenerateSummary','{\"caseId\": 5, \"source\": \"doctor_ui\", \"caseDbId\": 5}','NEW',50,0,5,'2026-08-08 14:33:23',NULL,NULL,NULL,11,NULL,'2026-08-08 14:33:23','2026-08-08 14:33:23'),(12,'CaseGenerateSummary','{\"caseId\": 5, \"source\": \"doctor_ui\", \"caseDbId\": 5}','NEW',50,0,5,'2026-08-08 14:33:24',NULL,NULL,NULL,11,NULL,'2026-08-08 14:33:24','2026-08-08 14:33:24'),(13,'CaseGenerateSummary','{\"caseId\": 5, \"source\": \"doctor_ui\", \"caseDbId\": 5}','NEW',50,0,5,'2026-08-08 14:33:24',NULL,NULL,NULL,11,NULL,'2026-08-08 14:33:24','2026-08-08 14:33:24'),(14,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T09:14:41.343Z\"}}','NEW',50,0,5,'2026-08-08 14:44:41',NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:44:41','2026-08-08 14:44:41'),(15,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T10:14:41.357Z\"}}','NEW',50,0,5,'2026-08-08 15:44:41',NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:44:41','2026-08-08 15:44:41'),(16,'CaseUpdated','{\"caseDbId\":4,\"stage\":\"WAITING_ON_PATIENT\",\"priority\":null,\"__meta\":{\"createdByUserId\":29,\"createdAt\":\"2026-08-08T10:25:01.007Z\"}}','NEW',50,0,5,'2026-08-08 15:55:01',NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:55:01','2026-08-08 15:55:01'),(17,'CaseGenerateSummary','{\"caseDbId\":4,\"caseId\":4,\"source\":\"admin_stage_change\",\"__meta\":{\"createdByUserId\":29,\"createdAt\":\"2026-08-08T10:25:01.012Z\"}}','NEW',50,0,5,'2026-08-08 15:55:01',NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:55:01','2026-08-08 15:55:01'),(18,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T11:08:08.093Z\"}}','NEW',50,0,5,'2026-08-08 16:38:08',NULL,NULL,NULL,NULL,NULL,'2026-08-08 16:38:08','2026-08-08 16:38:08'),(19,'CaseGenerateSummary','{\"caseId\": 10, \"source\": \"doctor_ui\", \"caseDbId\": 10}','NEW',50,0,5,'2026-08-08 16:52:43',NULL,NULL,NULL,11,NULL,'2026-08-08 16:52:43','2026-08-08 16:52:43'),(20,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T12:08:08.112Z\"}}','NEW',50,0,5,'2026-08-08 17:38:08',NULL,NULL,NULL,NULL,NULL,'2026-08-08 17:38:08','2026-08-08 17:38:08'),(21,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T15:02:06.457Z\"}}','NEW',50,0,5,'2026-08-08 20:32:06',NULL,NULL,NULL,NULL,NULL,'2026-08-08 20:32:06','2026-08-08 20:32:06'),(22,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T15:41:42.537Z\"}}','NEW',50,0,5,'2026-08-08 21:11:42',NULL,NULL,NULL,NULL,NULL,'2026-08-08 21:11:42','2026-08-08 21:11:42'),(23,'CaseUpdated','{\"caseDbId\":14,\"stage\":\"WAITING_ON_PATIENT\",\"nextAction\":\"Case created\",\"__meta\":{\"createdByUserId\":11,\"createdAt\":\"2026-08-08T16:35:53.403Z\"}}','NEW',50,0,5,'2026-08-08 22:05:53',NULL,NULL,NULL,NULL,NULL,'2026-08-08 22:05:53','2026-08-08 22:05:53'),(24,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T16:38:44.150Z\"}}','NEW',50,0,5,'2026-08-08 22:08:44',NULL,NULL,NULL,NULL,NULL,'2026-08-08 22:08:44','2026-08-08 22:08:44'),(25,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T17:30:58.149Z\"}}','NEW',50,0,5,'2026-08-08 23:00:58',NULL,NULL,NULL,NULL,NULL,'2026-08-08 23:00:58','2026-08-08 23:00:58'),(26,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-08T18:31:21.170Z\"}}','NEW',50,0,5,'2026-08-09 00:01:21',NULL,NULL,NULL,NULL,NULL,'2026-08-09 00:01:21','2026-08-09 00:01:21'),(27,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-09T07:51:13.765Z\"}}','NEW',50,0,5,'2026-08-09 13:21:13',NULL,NULL,NULL,NULL,NULL,'2026-08-09 13:21:13','2026-08-09 13:21:13'),(28,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-09T08:51:13.673Z\"}}','NEW',50,0,5,'2026-08-09 14:21:13',NULL,NULL,NULL,NULL,NULL,'2026-08-09 14:21:13','2026-08-09 14:21:13'),(29,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-09T09:51:13.632Z\"}}','NEW',50,0,5,'2026-08-09 15:21:13',NULL,NULL,NULL,NULL,NULL,'2026-08-09 15:21:13','2026-08-09 15:21:13'),(30,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-09T12:51:53.336Z\"}}','NEW',50,0,5,'2026-08-09 18:21:53',NULL,NULL,NULL,NULL,NULL,'2026-08-09 18:21:53','2026-08-09 18:21:53'),(31,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-10T03:04:19.113Z\"}}','NEW',50,0,5,'2026-08-10 08:34:19',NULL,NULL,NULL,NULL,NULL,'2026-08-10 08:34:19','2026-08-10 08:34:19'),(32,'InventoryMonitorTick','{\"horizon_days\":30,\"__meta\":{\"createdByUserId\":null,\"createdAt\":\"2026-08-10T04:04:20.515Z\"}}','NEW',50,0,5,'2026-08-10 09:34:20',NULL,NULL,NULL,NULL,NULL,'2026-08-10 09:34:20','2026-08-10 09:34:20');
/*!40000 ALTER TABLE `agent_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_audit_logs`
--

DROP TABLE IF EXISTS `appointment_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint unsigned NOT NULL,
  `actor_user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `meta_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_appt` (`appointment_id`),
  KEY `idx_audit_actor` (`actor_user_id`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_audit_logs`
--

LOCK TABLES `appointment_audit_logs` WRITE;
/*!40000 ALTER TABLE `appointment_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `appointment_uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointment_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` bigint unsigned NOT NULL,
  `doctor_id` bigint unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `predicted_duration_min` int DEFAULT NULL,
  `scheduled_end_time` time DEFAULT NULL,
  `follow_up_required` tinyint(1) NOT NULL DEFAULT '0',
  `follow_up_date` date DEFAULT NULL,
  `type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Requested',
  `operatory_id` bigint unsigned DEFAULT NULL,
  `clinic_id` bigint unsigned DEFAULT NULL,
  `actual_checkin_at` datetime DEFAULT NULL,
  `actual_start_at` datetime DEFAULT NULL,
  `actual_end_at` datetime DEFAULT NULL,
  `linked_case_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_appointments_uid` (`appointment_uid`),
  UNIQUE KEY `uq_appointments_code` (`appointment_code`),
  KEY `idx_appt_date_time` (`scheduled_date`,`scheduled_time`),
  KEY `idx_appt_doctor_date` (`doctor_id`,`scheduled_date`),
  KEY `idx_appt_patient_date` (`patient_id`,`scheduled_date`),
  KEY `idx_appt_status` (`status`),
  KEY `idx_appt_operatory` (`operatory_id`),
  KEY `idx_appt_linked_case` (`linked_case_id`),
  CONSTRAINT `fk_appt_case` FOREIGN KEY (`linked_case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_appt_operatory` FOREIGN KEY (`operatory_id`) REFERENCES `operatories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'APT-1001-1','CODE-1001-1',3,1,'2026-08-07','09:00:00',NULL,NULL,0,NULL,'Root Canal Treatment','CONFIRMED',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:20','2026-08-07 18:17:20'),(2,'APT-1002','AC-1002',21,11,'2026-08-08','09:30:00',NULL,'10:00:00',0,NULL,'Checkup','Confirmed',2,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(3,'APT-1003','AC-1003',22,10,'2026-08-08','10:00:00',NULL,'10:45:00',0,NULL,'Treatment','Confirmed',1,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(4,'APT-1002-1','CODE-1002-1',5,1,'2026-08-07','11:30:00',NULL,NULL,0,NULL,'Teeth Cleaning & Scaling','CHECKED IN',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(5,'APT-1003-1','CODE-1003-1',6,1,'2026-08-07','14:00:00',NULL,NULL,0,NULL,'Dental Crown Fitting','IN PROGRESS',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(6,'APT-1004-1','CODE-1004-1',7,1,'2026-08-07','16:15:00',NULL,NULL,0,NULL,'Orthodontic Checkup','Requested',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(7,'APT-1001-2','CODE-1001-2',4,2,'2026-08-07','09:00:00',NULL,NULL,0,NULL,'Root Canal Treatment','CONFIRMED',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(8,'APT-1002-2','CODE-1002-2',5,2,'2026-08-07','11:30:00',NULL,NULL,0,NULL,'Teeth Cleaning & Scaling','CHECKED IN',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(9,'APT-1003-2','CODE-1003-2',6,2,'2026-08-07','14:00:00',NULL,NULL,0,NULL,'Dental Crown Fitting','IN PROGRESS',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(10,'APT-1004-2','CODE-1004-2',7,2,'2026-08-07','16:15:00',NULL,NULL,0,NULL,'Orthodontic Checkup','Requested',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(11,'APT-1011','AC-1011',22,12,'2026-08-06','09:00:00',NULL,'09:45:00',0,NULL,'Treatment','Completed',3,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(12,'APT-1012','AC-1012',23,10,'2026-08-06','11:00:00',NULL,'11:30:00',0,NULL,'Checkup','Completed',1,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(13,'APT-1786179723441','AC-1786179723441',20,9,'2026-08-08','14:35:00',30,'15:05:00',0,NULL,'New patient consultation','Requested',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:32:03','2026-08-08 14:32:03'),(14,'APT-1301','AC-1301',13,10,'2026-08-08','10:00:00',NULL,'10:30:00',0,NULL,'Treatment','Confirmed',1,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43','2026-08-08 14:36:43'),(15,'APT-1302','AC-1302',13,11,'2026-08-08','11:30:00',NULL,'12:00:00',0,NULL,'Checkup','Confirmed',2,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43','2026-08-08 14:36:43'),(16,'APT-1303','AC-1303',13,10,'2026-08-07','09:00:00',NULL,'09:30:00',0,NULL,'Checkup','Completed',1,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43','2026-08-08 14:36:43'),(17,'APT-1304','AC-1304',13,12,'2026-08-05','14:00:00',NULL,'14:45:00',0,NULL,'Treatment','Completed',3,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43','2026-08-08 14:36:43'),(18,'APT-7001','AC-7001',32,10,'2026-08-09','14:00:00',NULL,'14:30:00',0,NULL,'Checkup','Confirmed',1,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40','2026-08-08 15:20:40'),(19,'APT-7002','AC-7002',32,11,'2026-08-12','15:30:00',NULL,'16:00:00',0,NULL,'Treatment','Confirmed',2,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40','2026-08-08 15:20:40'),(20,'APT-7003','AC-7003',32,10,'2026-08-05','11:00:00',NULL,'11:30:00',0,NULL,'Checkup','Completed',1,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40','2026-08-08 15:20:40'),(21,'APT-7004','AC-7004',32,12,'2026-08-02','10:00:00',NULL,'10:45:00',0,NULL,'Consultation','Completed',3,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40','2026-08-08 15:20:40');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_attachments`
--

DROP TABLE IF EXISTS `case_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `case_id` bigint unsigned NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by_user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_case_attach_case` (`case_id`),
  KEY `idx_case_attach_user` (`uploaded_by_user_id`),
  CONSTRAINT `fk_case_attach_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_case_attach_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_attachments`
--

LOCK TABLES `case_attachments` WRITE;
/*!40000 ALTER TABLE `case_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `case_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_doctors`
--

DROP TABLE IF EXISTS `case_doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_doctors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `case_id` bigint unsigned NOT NULL,
  `doctor_id` bigint unsigned NOT NULL,
  `role` enum('PRIMARY','CONSULT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONSULT',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_case_doc` (`case_id`,`doctor_id`),
  KEY `idx_case_doc_doc` (`doctor_id`),
  CONSTRAINT `fk_case_doctors_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_case_doctors_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_doctors`
--

LOCK TABLES `case_doctors` WRITE;
/*!40000 ALTER TABLE `case_doctors` DISABLE KEYS */;
/*!40000 ALTER TABLE `case_doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_summaries`
--

DROP TABLE IF EXISTS `case_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_summaries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `case_id` bigint unsigned NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `recommendation` text COLLATE utf8mb4_unicode_ci,
  `confidence` int NOT NULL DEFAULT '50',
  `status` enum('PENDING_REVIEW','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING_REVIEW',
  `created_by_agent` tinyint(1) NOT NULL DEFAULT '1',
  `approved_by_user_id` bigint unsigned DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_case_status` (`case_id`,`status`),
  KEY `idx_case_created` (`case_id`,`created_at`),
  KEY `fk_case_summaries_approver` (`approved_by_user_id`),
  CONSTRAINT `fk_case_summaries_approver` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_case_summaries_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_summaries`
--

LOCK TABLES `case_summaries` WRITE;
/*!40000 ALTER TABLE `case_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `case_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_timeline`
--

DROP TABLE IF EXISTS `case_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_timeline` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `case_id` bigint unsigned NOT NULL,
  `event_type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `meta_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_by_user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_case_time` (`case_id`,`created_at`),
  KEY `idx_case_event` (`case_id`,`event_type`),
  KEY `fk_case_timeline_user` (`created_by_user_id`),
  CONSTRAINT `fk_case_timeline_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_case_timeline_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_timeline`
--

LOCK TABLES `case_timeline` WRITE;
/*!40000 ALTER TABLE `case_timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `case_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `case_uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` bigint unsigned NOT NULL,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `case_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stage` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `pending_stage` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `risk_score` int NOT NULL DEFAULT '0',
  `next_action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `next_review_date` date DEFAULT NULL,
  `agent_insights_json` longtext COLLATE utf8mb4_unicode_ci,
  `agent_summary` text COLLATE utf8mb4_unicode_ci,
  `agent_recommendation` text COLLATE utf8mb4_unicode_ci,
  `approval_required` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cases_case_uid` (`case_uid`),
  KEY `idx_cases_patient` (`patient_id`),
  KEY `idx_cases_doctor` (`doctor_id`),
  KEY `idx_cases_stage` (`stage`),
  KEY `idx_cases_updated_at` (`updated_at`),
  CONSTRAINT `fk_cases_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cases_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
INSERT INTO `cases` VALUES (1,'CASE-1786106575186',3,1,'pain when we are eating cold iteams and also the blood is coming out of the cavities','WAITING_ON_PATIENT',NULL,'MEDIUM',0,'lower jaw',NULL,NULL,NULL,NULL,1,'2026-08-07 18:12:55','2026-08-07 18:12:55'),(2,'CAS-1002',21,11,'Tooth Pain Treatment','IN_REVIEW',NULL,'MEDIUM',0,NULL,NULL,NULL,'Upper molar pain. Possible cavity. X-ray ordered.',NULL,1,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(3,'CAS-1003',22,10,'Root Canal Treatment','IN_REVIEW',NULL,'HIGH',0,NULL,NULL,NULL,'Root canal in progress. Session 2 pending.',NULL,1,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(4,'CAS-1004',23,12,'Orthodontic Braces','WAITING_ON_PATIENT',NULL,'MEDIUM',0,NULL,NULL,NULL,'Braces fitted. Monthly tightening scheduled.',NULL,1,'2026-08-08 14:28:52','2026-08-08 15:55:00'),(5,'CAS-1005',24,11,'Cavity Filling','RESOLVED',NULL,'LOW',0,NULL,NULL,NULL,'Two cavities filled. Recovery normal.',NULL,1,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(6,'CAS-1006',25,10,'Gum Disease Treatment','IN_REVIEW',NULL,'MEDIUM',0,NULL,NULL,NULL,'Moderate gingivitis. Deep cleaning recommended.',NULL,1,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(7,'CAS-1007',26,12,'Tooth Extraction','NEW',NULL,'HIGH',0,NULL,NULL,NULL,'Wisdom tooth extraction scheduled.',NULL,1,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(8,'CAS-1008',27,11,'Teeth Whitening','NEW',NULL,'LOW',0,NULL,NULL,NULL,'Professional whitening consultation done.',NULL,1,'2026-08-08 14:28:52','2026-08-08 14:28:52'),(9,'CAS-1301',13,10,'Comprehensive Dental Scaling & Cleaning','IN_REVIEW',NULL,'MEDIUM',0,NULL,NULL,NULL,'Patient completed initial scaling. Plaque reduction observed. Mild gingival sensitivity.','Schedule follow-up fluoride treatment in 2 weeks. Maintain daily flossing routine.',1,'2026-08-08 14:36:43','2026-08-08 14:36:43'),(10,'CAS-1302',13,11,'Composite Tooth Filling','RESOLVED',NULL,'LOW',0,NULL,NULL,NULL,'Upper right molar cavity successfully restored with A2 shade composite resin.','Avoid extremely hot or cold beverages for 24 hours. Good oral hygiene maintained.',1,'2026-08-08 14:36:43','2026-08-08 14:36:43'),(11,'CAS-7001',32,10,'Laser Teeth Whitening & Polishing','IN_REVIEW',NULL,'MEDIUM',0,NULL,NULL,NULL,'Patient requested aesthetic shade brightening. Shade A3 to A1 target.','Perform 2 whitening cycles. Apply desensitizing gel after session.',1,'2026-08-08 15:20:40','2026-08-08 15:20:40'),(12,'CAS-7002',32,11,'Composite Cavity Restoration','RESOLVED',NULL,'LOW',0,NULL,NULL,NULL,'Lower left molar cavity cleaned and filled with resin.','Regular brushing twice daily. Follow up checkup in 6 months.',1,'2026-08-08 15:20:40','2026-08-08 15:20:40'),(13,'CAS-7003',32,12,'Periodontal Gingivitis Prevention','NEW',NULL,'MEDIUM',0,NULL,NULL,NULL,'Mild bleeding on probing observed during routine checkup.','Chlorhexidine mouthwash prescribed for 7 days. Gentle scaling scheduled.',1,'2026-08-08 15:20:40','2026-08-08 15:20:40'),(14,'CASE-1786206953394',3,11,'tooth','WAITING_ON_PATIENT',NULL,'MEDIUM',0,'left',NULL,NULL,NULL,NULL,1,'2026-08-08 22:05:53','2026-08-08 22:05:53');
/*!40000 ALTER TABLE `cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinic_settings`
--

DROP TABLE IF EXISTS `clinic_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinic_settings` (
  `id` tinyint NOT NULL,
  `clinic_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clinic_phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clinic_email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clinic_address` text COLLATE utf8mb4_unicode_ci,
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Kolkata',
  `working_hours_json` longtext COLLATE utf8mb4_unicode_ci,
  `treatment_catalog_json` longtext COLLATE utf8mb4_unicode_ci,
  `note_templates_json` longtext COLLATE utf8mb4_unicode_ci,
  `ai_preferences_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinic_settings`
--

LOCK TABLES `clinic_settings` WRITE;
/*!40000 ALTER TABLE `clinic_settings` DISABLE KEYS */;
INSERT INTO `clinic_settings` VALUES (1,'SmileCare Dental Clinic','+91-9876543210','info@smilecare.com','42, MG Road, Hyderabad, Telangana - 500001','Asia/Kolkata','{\"start\":\"09:00\",\"end\":\"18:00\",\"stepMin\":15,\"days\":[1,2,3,4,5,6]}','[]','[]','{\"enableAiSummaries\":true,\"enableSmartScheduling\":true}','2026-05-09 15:25:41','2026-08-08 22:06:45');
/*!40000 ALTER TABLE `clinic_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `idempotency_locks`
--

DROP TABLE IF EXISTS `idempotency_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `idempotency_locks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lock_key` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `locked_by` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lock_key` (`lock_key`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_locked_by` (`locked_by`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `idempotency_locks`
--

LOCK TABLES `idempotency_locks` WRITE;
/*!40000 ALTER TABLE `idempotency_locks` DISABLE KEYS */;
INSERT INTO `idempotency_locks` VALUES (1,'inventory_monitor:2026-05-09:15','server-inline','2026-05-10 15:25:46','2026-05-09 15:25:46'),(2,'inventory_monitor:2026-08-07:17','server-inline','2026-08-08 17:46:16','2026-08-07 17:46:16'),(3,'inventory_monitor:2026-08-07:18','server-inline','2026-08-08 18:02:49','2026-08-07 18:02:49'),(6,'inventory_monitor:2026-08-08:13','server-inline','2026-08-09 13:44:41','2026-08-08 13:44:41'),(7,'inventory_monitor:2026-08-08:14','server-inline','2026-08-09 14:44:41','2026-08-08 14:44:41'),(8,'inventory_monitor:2026-08-08:15','server-inline','2026-08-09 15:44:41','2026-08-08 15:44:41'),(9,'inventory_monitor:2026-08-08:16','server-inline','2026-08-09 16:38:08','2026-08-08 16:38:08'),(12,'inventory_monitor:2026-08-08:17','server-inline','2026-08-09 17:38:08','2026-08-08 17:38:08'),(14,'inventory_monitor:2026-08-08:20','server-inline','2026-08-09 20:32:06','2026-08-08 20:32:06'),(15,'inventory_monitor:2026-08-08:21','server-inline','2026-08-09 21:11:43','2026-08-08 21:11:43'),(17,'inventory_monitor:2026-08-08:22','server-inline','2026-08-09 22:08:44','2026-08-08 22:08:44'),(22,'inventory_monitor:2026-08-08:23','server-inline','2026-08-09 23:00:58','2026-08-08 23:00:58'),(32,'inventory_monitor:2026-08-09:0','server-inline','2026-08-10 00:01:21','2026-08-09 00:01:21'),(34,'inventory_monitor:2026-08-09:13','server-inline','2026-08-10 13:21:14','2026-08-09 13:21:14'),(35,'inventory_monitor:2026-08-09:14','server-inline','2026-08-10 14:21:14','2026-08-09 14:21:14'),(36,'inventory_monitor:2026-08-09:15','server-inline','2026-08-10 15:21:14','2026-08-09 15:21:14'),(37,'inventory_monitor:2026-08-09:18','server-inline','2026-08-10 18:21:53','2026-08-09 18:21:53'),(38,'inventory_monitor:2026-08-10:8','server-inline','2026-08-11 08:34:19','2026-08-10 08:34:19'),(40,'inventory_monitor:2026-08-10:9','server-inline','2026-08-11 09:34:20','2026-08-10 09:34:20');
/*!40000 ALTER TABLE `idempotency_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_alerts`
--

DROP TABLE IF EXISTS `inventory_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alert_type` enum('LOW_STOCK','EXPIRING_SOON','EXPIRED','ANOMALY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','ACK','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_item_type` (`item_code`,`alert_type`),
  KEY `idx_type_status` (`alert_type`,`status`),
  KEY `idx_alert_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_alerts`
--

LOCK TABLES `inventory_alerts` WRITE;
/*!40000 ALTER TABLE `inventory_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_anomaly_logs`
--

DROP TABLE IF EXISTS `inventory_anomaly_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_anomaly_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `avg_30d` decimal(10,2) DEFAULT NULL,
  `appointment_id` bigint unsigned DEFAULT NULL,
  `visit_id` bigint unsigned DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_anom_doctor` (`doctor_id`),
  KEY `idx_anom_item` (`item_code`),
  KEY `idx_anom_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_anomaly_logs`
--

LOCK TABLES `inventory_anomaly_logs` WRITE;
/*!40000 ALTER TABLE `inventory_anomaly_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_anomaly_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Uncategorized',
  `stock` int NOT NULL DEFAULT '0',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Healthy',
  `reorder_threshold` int DEFAULT '0',
  `expiry_date` date DEFAULT NULL,
  `vendor_id` bigint unsigned DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `target_stock` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inventory_item_code` (`item_code`),
  KEY `idx_inventory_name` (`name`),
  KEY `idx_inventory_category` (`category`),
  KEY `idx_inventory_stock` (`stock`),
  KEY `idx_inventory_vendor` (`vendor_id`),
  KEY `idx_inventory_expiry` (`expiry_date`),
  CONSTRAINT `fk_inventory_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES (1,'INV001','Dental Gloves (Box)','PPE',45,'Healthy',10,'2027-12-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(2,'INV002','Face Masks (Box)','PPE',30,'Healthy',10,'2027-06-30',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(3,'INV003','Composite Resin (A2)','Restorative',12,'Healthy',5,'2027-03-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(4,'INV004','Local Anesthetic (Lidocaine)','Anesthetic',20,'Healthy',8,'2026-12-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(5,'INV005','Dental Floss (Roll)','Preventive',50,'Healthy',15,'2028-01-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(6,'INV006','Dental X-Ray Films','Diagnostic',8,'Low Stock',5,'2026-11-30',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(7,'INV007','Suture Thread','Surgical',15,'Healthy',5,'2027-08-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(8,'INV008','Fluoride Varnish','Preventive',10,'Healthy',4,'2027-02-28',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(9,'INV009','Dental Cement','Restorative',6,'Low Stock',3,'2026-10-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(10,'INV010','Teeth Whitening Gel','Cosmetic',20,'Healthy',5,'2027-05-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(11,'INV011','Orthodontic Brackets','Orthodontic',100,'Healthy',20,'2028-12-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(12,'INV012','Saliva Ejectors (Pack)','General',80,'Healthy',20,'2028-06-30',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(13,'INV013','Bib Clips','General',40,'Healthy',10,'2030-01-01',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(14,'INV014','Root Canal Files','Endodontic',25,'Healthy',8,'2028-12-31',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21'),(15,'INV015','Extraction Forceps','Surgical',5,'Healthy',2,'2030-01-01',NULL,NULL,NULL,'2026-08-08 14:29:21','2026-08-08 14:29:21');
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_usage_daily`
--

DROP TABLE IF EXISTS `inventory_usage_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_usage_daily` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usage_date` date NOT NULL,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `procedure_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty_used` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usage_daily` (`usage_date`,`doctor_id`,`procedure_code`,`item_code`),
  KEY `idx_usage_date` (`usage_date`),
  KEY `idx_usage_doctor` (`doctor_id`),
  KEY `idx_usage_proc` (`procedure_code`),
  KEY `idx_usage_item` (`item_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_usage_daily`
--

LOCK TABLES `inventory_usage_daily` WRITE;
/*!40000 ALTER TABLE `inventory_usage_daily` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_usage_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_usage_logs`
--

DROP TABLE IF EXISTS `inventory_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_usage_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint unsigned DEFAULT NULL,
  `visit_id` bigint unsigned DEFAULT NULL,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty_used` int NOT NULL DEFAULT '0',
  `source` enum('AUTO','MANUAL','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AUTO',
  `meta_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usage_appt` (`appointment_id`),
  KEY `idx_usage_visit` (`visit_id`),
  KEY `idx_usage_doctor` (`doctor_id`),
  KEY `idx_usage_item` (`item_code`),
  CONSTRAINT `fk_usage_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usage_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usage_visit` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_usage_logs`
--

LOCK TABLES `inventory_usage_logs` WRITE;
/*!40000 ALTER TABLE `inventory_usage_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_usage_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint unsigned NOT NULL,
  `visit_procedure_id` bigint unsigned DEFAULT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `item_type` enum('PROCEDURE','MATERIAL','APPARATUS') COLLATE utf8mb4_unicode_ci DEFAULT 'PROCEDURE',
  PRIMARY KEY (`id`),
  KEY `idx_inv_items_invoice` (`invoice_id`),
  KEY `idx_inv_items_code` (`code`),
  KEY `idx_inv_items_vpid` (`visit_procedure_id`),
  CONSTRAINT `fk_inv_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_invoice_items_vpid` FOREIGN KEY (`visit_procedure_id`) REFERENCES `visit_procedures` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (1,1,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:29:21','PROCEDURE'),(2,1,NULL,'','Teeth Cleaning',1,800.00,800.00,'2026-08-08 14:29:21','PROCEDURE'),(3,2,NULL,'','Cavity Filling',1,1500.00,1500.00,'2026-08-08 14:29:21','PROCEDURE'),(4,3,NULL,'','Root Canal - Sess 1',1,3000.00,3000.00,'2026-08-08 14:29:21','PROCEDURE'),(5,3,NULL,'','Root Canal - Sess 2',1,3000.00,3000.00,'2026-08-08 14:29:21','PROCEDURE'),(6,4,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:29:21','PROCEDURE'),(7,4,NULL,'','X-Ray',1,300.00,300.00,'2026-08-08 14:29:21','PROCEDURE'),(8,5,NULL,'','Cavity Filling',1,1500.00,1500.00,'2026-08-08 14:29:21','PROCEDURE'),(9,6,NULL,'','Deep Cleaning',1,2000.00,2000.00,'2026-08-08 14:29:21','PROCEDURE'),(10,6,NULL,'','Fluoride Treatment',1,400.00,400.00,'2026-08-08 14:29:21','PROCEDURE'),(11,6,NULL,'','X-Ray',1,300.00,300.00,'2026-08-08 14:29:21','PROCEDURE'),(12,6,NULL,'','Dental Checkup',1,100.00,100.00,'2026-08-08 14:29:21','PROCEDURE'),(13,7,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:29:21','PROCEDURE'),(14,8,NULL,'','Tooth Extraction',1,2500.00,2500.00,'2026-08-08 14:29:21','PROCEDURE'),(15,1,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:30:06','PROCEDURE'),(16,1,NULL,'','Teeth Cleaning',1,800.00,800.00,'2026-08-08 14:30:06','PROCEDURE'),(17,2,NULL,'','Cavity Filling',1,1500.00,1500.00,'2026-08-08 14:30:06','PROCEDURE'),(18,3,NULL,'','Root Canal - Sess 1',1,3000.00,3000.00,'2026-08-08 14:30:06','PROCEDURE'),(19,3,NULL,'','Root Canal - Sess 2',1,3000.00,3000.00,'2026-08-08 14:30:06','PROCEDURE'),(20,4,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:30:06','PROCEDURE'),(21,4,NULL,'','X-Ray',1,300.00,300.00,'2026-08-08 14:30:06','PROCEDURE'),(22,5,NULL,'','Cavity Filling',1,1500.00,1500.00,'2026-08-08 14:30:06','PROCEDURE'),(23,6,NULL,'','Deep Cleaning',1,2000.00,2000.00,'2026-08-08 14:30:06','PROCEDURE'),(24,6,NULL,'','Fluoride Treatment',1,400.00,400.00,'2026-08-08 14:30:06','PROCEDURE'),(25,6,NULL,'','X-Ray',1,300.00,300.00,'2026-08-08 14:30:06','PROCEDURE'),(26,6,NULL,'','Dental Checkup',1,100.00,100.00,'2026-08-08 14:30:06','PROCEDURE'),(27,7,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:30:06','PROCEDURE'),(28,8,NULL,'','Tooth Extraction',1,2500.00,2500.00,'2026-08-08 14:30:06','PROCEDURE'),(29,1,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:30:49','PROCEDURE'),(30,1,NULL,'','Teeth Cleaning',1,800.00,800.00,'2026-08-08 14:30:49','PROCEDURE'),(31,2,NULL,'','Cavity Filling',1,1500.00,1500.00,'2026-08-08 14:30:49','PROCEDURE'),(32,3,NULL,'','Root Canal - Sess 1',1,3000.00,3000.00,'2026-08-08 14:30:49','PROCEDURE'),(33,3,NULL,'','Root Canal - Sess 2',1,3000.00,3000.00,'2026-08-08 14:30:49','PROCEDURE'),(34,4,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:30:49','PROCEDURE'),(35,4,NULL,'','X-Ray',1,300.00,300.00,'2026-08-08 14:30:49','PROCEDURE'),(36,5,NULL,'','Cavity Filling',1,1500.00,1500.00,'2026-08-08 14:30:49','PROCEDURE'),(37,6,NULL,'','Deep Cleaning',1,2000.00,2000.00,'2026-08-08 14:30:49','PROCEDURE'),(38,6,NULL,'','Fluoride Treatment',1,400.00,400.00,'2026-08-08 14:30:49','PROCEDURE'),(39,6,NULL,'','X-Ray',1,300.00,300.00,'2026-08-08 14:30:49','PROCEDURE'),(40,6,NULL,'','Dental Checkup',1,100.00,100.00,'2026-08-08 14:30:49','PROCEDURE'),(41,7,NULL,'','Dental Checkup',1,500.00,500.00,'2026-08-08 14:30:49','PROCEDURE'),(42,8,NULL,'','Tooth Extraction',1,2500.00,2500.00,'2026-08-08 14:30:49','PROCEDURE');
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint unsigned NOT NULL,
  `issue_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('Pending','Paid','Overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `claim_status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insurance_status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `claim_submitted_at` datetime DEFAULT NULL,
  `claim_rejected_at` datetime DEFAULT NULL,
  `claim_denied_at` datetime DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `appointment_id` bigint unsigned DEFAULT NULL,
  `invoice_type` enum('PROVISIONAL','FINAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FINAL',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inv_patient` (`patient_id`),
  KEY `idx_inv_issue_date` (`issue_date`),
  KEY `idx_inv_status` (`status`),
  KEY `idx_inv_paid_date` (`paid_date`),
  KEY `idx_inv_appt` (`appointment_id`),
  CONSTRAINT `fk_inv_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,20,'2026-08-07',1300.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-07',9,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(2,21,'2026-08-07',1500.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-07',10,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(3,22,'2026-08-06',6000.00,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,11,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(4,23,'2026-08-06',800.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-06',12,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(5,24,'2026-08-08',1500.00,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,5,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(6,25,'2026-08-08',2800.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-08',6,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(7,20,'2026-08-08',500.00,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,1,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(8,26,'2026-08-08',2500.00,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,7,'FINAL','2026-08-08 14:29:21','2026-08-08 14:29:21'),(9,13,'2026-08-07',1500.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-07',3,'FINAL','2026-08-08 14:36:43','2026-08-08 14:36:43'),(10,13,'2026-08-05',2500.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-05',4,'FINAL','2026-08-08 14:36:43','2026-08-08 14:36:43'),(11,13,'2026-08-08',800.00,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,1,'FINAL','2026-08-08 14:36:43','2026-08-08 14:36:43'),(12,32,'2026-08-05',1200.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-05',3,'FINAL','2026-08-08 15:20:40','2026-08-08 15:20:40'),(13,32,'2026-08-02',2800.00,'Paid',NULL,NULL,NULL,NULL,NULL,'2026-08-02',4,'FINAL','2026-08-08 15:20:40','2026-08-08 15:20:40'),(14,32,'2026-08-09',4500.00,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,1,'FINAL','2026-08-08 15:20:40','2026-08-08 15:20:40');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `user_role` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel` enum('IN_APP','EMAIL','SMS','WHATSAPP','CALL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_APP',
  `type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('NEW','PENDING','SENT','FAILED','READ') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `scheduled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `priority` int NOT NULL DEFAULT '100',
  `related_entity_type` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_entity_id` bigint DEFAULT NULL,
  `template_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_vars_json` longtext COLLATE utf8mb4_unicode_ci,
  `meta_json` longtext COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_scheduled` (`scheduled_at`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_role` (`user_role`),
  KEY `idx_scheduled_at` (`scheduled_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,8,'Admin','IN_APP','APPOINTMENT','New Appointment Booked','Amit Patel booked appointment for 08-Aug 9:00 AM','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(2,8,'Admin','IN_APP','PAYMENT','Payment Received','Invoice #1 paid by Amit Patel - Ôé╣1,300','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(3,8,'Admin','IN_APP','INVENTORY','Low Stock Alert','Dental X-Ray Films running low (8 remaining)','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(4,8,'Admin','IN_APP','INVENTORY','Low Stock Alert','Dental Cement running low (6 remaining)','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(5,10,'Doctor','IN_APP','APPOINTMENT','Appointment Reminder','You have 5 appointments scheduled for today','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(6,11,'Doctor','IN_APP','APPOINTMENT','New Patient Assigned','Lavanya Singh assigned for whitening consultation 2:30 PM','READ',NULL,'2026-08-08 14:30:49',NULL,'2026-08-08 16:48:46',100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 16:48:46'),(7,20,'Patient','IN_APP','APPOINTMENT','Appointment Confirmed','Your appointment on 08-Aug at 9:00 AM is confirmed','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(8,21,'Patient','IN_APP','APPOINTMENT','Reminder','Reminder: Appointment tomorrow at 9:30 AM','NEW',NULL,'2026-08-08 14:30:49',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:30:49'),(9,13,'Patient','IN_APP','APPOINTMENT','Appointment Confirmed','Your treatment appointment with Dr. Rajesh Kumar is confirmed for Today at 10:00 AM.','NEW',NULL,'2026-08-08 14:36:43',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43'),(10,13,'Patient','IN_APP','CLINIC','Treatment Summary Updated','Dr. Rajesh Kumar added a new treatment summary for Scaling & Cleaning.','NEW',NULL,'2026-08-08 14:36:43',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43'),(11,13,'Patient','IN_APP','BILLING','New Invoice Generated','Invoice #3 for Ôé╣800 has been generated for your visit today.','NEW',NULL,'2026-08-08 14:36:43',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 14:36:43'),(12,32,'Patient','IN_APP','APPOINTMENT','Appointment Confirmed','Your visit with Dr. Rajesh Kumar is scheduled for Tomorrow at 02:00 PM.','NEW',NULL,'2026-08-08 15:20:40',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40'),(13,32,'Patient','IN_APP','CLINIC','Case Update','Dr. Priya Sharma updated your Composite Cavity Restoration plan.','NEW',NULL,'2026-08-08 15:20:40',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40'),(14,32,'Patient','IN_APP','BILLING','Invoice Ready','Invoice #7 for Ôé╣4,500 has been generated for your upcoming visit.','NEW',NULL,'2026-08-08 15:20:40',NULL,NULL,100,NULL,NULL,NULL,NULL,NULL,'2026-08-08 15:20:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operatories`
--

DROP TABLE IF EXISTS `operatories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operatories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_operatories_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operatories`
--

LOCK TABLES `operatories` WRITE;
/*!40000 ALTER TABLE `operatories` DISABLE KEYS */;
INSERT INTO `operatories` VALUES (1,'Room 1',1),(2,'Room 2',1),(3,'Room 3',1);
/*!40000 ALTER TABLE `operatories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_profiles`
--

DROP TABLE IF EXISTS `patient_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_profiles` (
  `user_id` bigint unsigned NOT NULL,
  `medical_history` text COLLATE utf8mb4_unicode_ci,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `billed_override` decimal(10,2) DEFAULT NULL,
  `paid_override` decimal(10,2) DEFAULT NULL,
  `balance_override` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_profiles`
--

LOCK TABLES `patient_profiles` WRITE;
/*!40000 ALTER TABLE `patient_profiles` DISABLE KEYS */;
INSERT INTO `patient_profiles` VALUES (13,'Routine preventive care','None','Patient prefers morning visits','2026-08-08 14:36:43',NULL,NULL,NULL),(20,'No major illness','Penicillin','Regular checkup patient','2026-08-08 14:27:58',NULL,NULL,NULL),(21,'Hypertension','None','Needs gentle treatment','2026-08-08 14:27:58',NULL,NULL,NULL),(22,'Diabetes Type 2','Aspirin','Blood sugar monitoring required','2026-08-08 14:27:58',NULL,NULL,NULL),(23,'None','Latex','Latex-free gloves required','2026-08-08 14:27:58',NULL,NULL,NULL),(24,'Asthma','None','Inhaler available','2026-08-08 14:27:58',NULL,NULL,NULL),(25,'Thyroid condition','None','On thyroid medication','2026-08-08 14:27:58',NULL,NULL,NULL),(26,'Heart condition','Ibuprofen','Consult physician before surgery','2026-08-08 14:27:58',NULL,NULL,NULL),(27,'None','None','First-time patient','2026-08-08 14:27:58',NULL,NULL,NULL),(32,'No chronic conditions','None','Prefers afternoon appointments','2026-08-08 15:20:40',NULL,NULL,NULL);
/*!40000 ALTER TABLE `patient_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procedure_catalog`
--

DROP TABLE IF EXISTS `procedure_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procedure_catalog` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `default_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_proc_code` (`code`),
  KEY `idx_proc_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procedure_catalog`
--

LOCK TABLES `procedure_catalog` WRITE;
/*!40000 ALTER TABLE `procedure_catalog` DISABLE KEYS */;
INSERT INTO `procedure_catalog` VALUES (1,'GENERAL','General consultation',0.00),(2,'SCALING','Scaling',0.00),(3,'FILLING','Filling',0.00),(4,'ROOT_CANAL','Root canal',0.00),(5,'EXTRACTION','Extraction',0.00),(6,'IMPLANT','Implant',0.00),(7,'EXT002','Tooth Extraction (Complex)',2500.00),(8,'ORT001','Braces (Full)',25000.00),(9,'WHT001','Teeth Whitening',5000.00),(10,'CRW001','Crown (Ceramic)',8000.00),(11,'SCL001','Deep Cleaning (Scaling)',2000.00),(12,'FLR001','Fluoride Treatment',400.00);
/*!40000 ALTER TABLE `procedure_catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procedure_consumables`
--

DROP TABLE IF EXISTS `procedure_consumables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procedure_consumables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `procedure_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_proc_item` (`procedure_type`,`item_code`),
  KEY `idx_pc_proc` (`procedure_type`),
  KEY `idx_pc_item` (`item_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procedure_consumables`
--

LOCK TABLES `procedure_consumables` WRITE;
/*!40000 ALTER TABLE `procedure_consumables` DISABLE KEYS */;
/*!40000 ALTER TABLE `procedure_consumables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_order_id` bigint unsigned NOT NULL,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` int NOT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_po_item` (`purchase_order_id`,`item_code`),
  KEY `idx_po` (`purchase_order_id`),
  CONSTRAINT `fk_poi_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_items`
--

LOCK TABLES `purchase_order_items` WRITE;
/*!40000 ALTER TABLE `purchase_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint unsigned NOT NULL,
  `status` enum('DRAFT','SENT','RECEIVED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `requested_by_user_id` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vendor_status` (`vendor_id`,`status`),
  KEY `idx_po_requested_by` (`requested_by_user_id`),
  CONSTRAINT `fk_po_requested_by` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_po_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenue_analytics_daily`
--

DROP TABLE IF EXISTS `revenue_analytics_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenue_analytics_daily` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usage_date` date NOT NULL,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `procedure_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_revenue` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_qty` decimal(12,2) NOT NULL DEFAULT '0.00',
  `appointment_count` int NOT NULL DEFAULT '0',
  `chair_minutes` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rev_daily` (`usage_date`,`doctor_id`,`procedure_code`),
  KEY `idx_rev_date` (`usage_date`),
  KEY `idx_rev_doctor` (`doctor_id`),
  KEY `idx_rev_proc` (`procedure_code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenue_analytics_daily`
--

LOCK TABLES `revenue_analytics_daily` WRITE;
/*!40000 ALTER TABLE `revenue_analytics_daily` DISABLE KEYS */;
INSERT INTO `revenue_analytics_daily` VALUES (1,'2026-08-01',10,NULL,8500.00,0.00,6,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(2,'2026-08-01',11,NULL,6000.00,0.00,5,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(3,'2026-08-01',12,NULL,4500.00,0.00,4,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(4,'2026-08-02',10,NULL,9000.00,0.00,7,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(5,'2026-08-02',11,NULL,7500.00,0.00,6,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(6,'2026-08-03',12,NULL,5000.00,0.00,4,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(7,'2026-08-04',10,NULL,12000.00,0.00,8,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(8,'2026-08-04',11,NULL,8000.00,0.00,6,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(9,'2026-08-05',12,NULL,6500.00,0.00,5,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(10,'2026-08-06',10,NULL,9800.00,0.00,7,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(11,'2026-08-07',11,NULL,11000.00,0.00,8,0,'2026-08-08 14:30:49','2026-08-08 14:30:49'),(12,'2026-08-08',10,NULL,7800.00,0.00,6,0,'2026-08-08 14:30:49','2026-08-08 14:30:49');
/*!40000 ALTER TABLE `revenue_analytics_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenue_insights`
--

DROP TABLE IF EXISTS `revenue_insights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenue_insights` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `as_of_date` date NOT NULL,
  `insight_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `range_label` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `raw_json` longtext COLLATE utf8mb4_unicode_ci,
  `forecast_json` longtext COLLATE utf8mb4_unicode_ci,
  `kpi_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rev_as_of_type` (`as_of_date`,`insight_type`,`range_label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenue_insights`
--

LOCK TABLES `revenue_insights` WRITE;
/*!40000 ALTER TABLE `revenue_insights` DISABLE KEYS */;
/*!40000 ALTER TABLE `revenue_insights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role` enum('Admin','Doctor','Assistant','Patient') COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissions_json` longtext COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES ('Admin','{\"admin_all\":true}','2026-05-09 15:25:41'),('Doctor','{\"doctor_portal\":true,\"cases\":true,\"appointments\":true}','2026-05-09 15:25:41'),('Assistant','{\"assistant_portal\":true,\"inventory\":true,\"appointments\":true}','2026-05-09 15:25:41'),('Patient','{\"patient_portal\":true,\"appointments\":true,\"billing\":true}','2026-05-09 15:25:41');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(24) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('Admin','Doctor','Patient') COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_code` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_uid` (`uid`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'DC-4572','teju','venkatalikhithd@gmail.com','7207509885',NULL,'female',NULL,'Doctor','$2b$10$NtuGqcguKQ2/XTiUtxDOzeukfOFUm9CRDOq1hqLbFCtrJ/4BkG.au',NULL,NULL,'2026-05-09 15:39:43','2026-08-07 18:05:54'),(2,'DC-3374','Sravanthi','sravanthipsravanthi3@gmail.com',NULL,NULL,NULL,NULL,'Doctor','$2b$10$vUCzOIAPBIgwH3/IgMIDD.GDRi3vel0mlGxj/xm9l5kuOCBZJaTze',NULL,NULL,'2026-08-07 18:08:15','2026-08-07 18:09:12'),(3,'PT-1637','teju',NULL,NULL,NULL,NULL,NULL,'Patient',NULL,NULL,NULL,'2026-08-07 18:12:55','2026-08-07 18:12:55'),(4,'PAT-200','John Doe','patient0@clinic.com',NULL,NULL,NULL,NULL,'Patient',NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(5,'PAT-201','Sarah Connor','patient1@clinic.com',NULL,NULL,NULL,NULL,'Patient',NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(6,'PAT-202','Michael Scott','patient2@clinic.com',NULL,NULL,NULL,NULL,'Patient',NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(7,'PAT-203','Emma Watson','patient3@clinic.com',NULL,NULL,NULL,NULL,'Patient',NULL,NULL,NULL,'2026-08-07 18:17:55','2026-08-07 18:17:55'),(8,'AD-5131','Admin','admin@dental.com',NULL,NULL,NULL,NULL,'Admin','$2b$10$hJt4uFIPbonRKfsBYRtbY.M/DExaMlDOYz.OP1xLrkakdV/R7Zqu2',NULL,NULL,'2026-08-08 13:48:07','2026-08-08 13:48:07'),(9,'DC-1173','likithchowdary41','likithchowdary41@gmail.com',NULL,NULL,NULL,NULL,'Doctor','$2b$10$IODVJrE6eYFOxq.NRqa4mOYc2H3gpayhFHcqzNbL1NMEVBQHQkPma',NULL,NULL,'2026-08-08 13:48:34','2026-08-08 13:48:34'),(10,'AD-9976','tejuswinimanne','tejuswinimanne@134',NULL,NULL,NULL,NULL,'Admin','$2b$10$VPs9MpUy5.Z0KHPN5A4qh.We5b6h5OkaK4RFU91/Tb/9WXbSGwaJm',NULL,NULL,'2026-08-08 13:54:05','2026-08-08 13:54:05'),(11,'PT-1213','teju','teju@1234567',NULL,NULL,NULL,NULL,'Doctor','$2b$10$sNc5eOBYnAyXLCySujhF.OU5L2xoLJEZLPFAGLnkmeHmX6Xv2qFSG',NULL,NULL,'2026-08-08 13:59:41','2026-08-08 16:49:11'),(13,'DC-9342','teju','teju@gmail.com',NULL,NULL,NULL,NULL,'Patient','$2b$10$p4y07gj8pAU850V/KITntOtQ8VK99RQU0GsCVlnObW2vOFni0y982',NULL,NULL,'2026-08-08 14:04:29','2026-08-08 23:49:15'),(14,'DC-1249','teju','teju@1233',NULL,NULL,NULL,NULL,'Patient','$2b$10$ZUYEioel0tAAfZkmLfZc0..A966EVsEZ1ta8kXeq9Nq0aPLOeGhEu',NULL,NULL,'2026-08-08 14:17:33','2026-08-08 14:43:18'),(20,'PT-2001','Amit Patel','amit.patel@gmail.com','9876502001','1995-05-10','Male',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(21,'PT-2002','Sunita Verma','sunita.verma@gmail.com','9876502002','1988-09-18','Female',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(22,'PT-2003','Kiran Mehta','kiran.mehta@gmail.com','9876502003','2000-01-25','Male',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(23,'PT-2004','Deepa Nair','deepa.nair@gmail.com','9876502004','1992-06-14','Female',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(24,'PT-2005','Rahul Gupta','rahul.gupta@gmail.com','9876502005','1998-12-03','Male',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(25,'PT-2006','Meena Iyer','meena.iyer@gmail.com','9876502006','1975-04-20','Female',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(26,'PT-2007','Suresh Babu','suresh.babu@gmail.com','9876502007','1980-08-07','Male',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(27,'PT-2008','Lavanya Singh','lavanya.singh@gmail.com','9876502008','2002-02-28','Female',NULL,'Patient','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2',NULL,NULL,'2026-08-08 14:27:58','2026-08-08 14:27:58'),(28,'AD-5556','teju1234','teju1234@gmail.com',NULL,NULL,NULL,NULL,'Admin','$2b$10$.WV3PdT7Xi0xcjuqsC6axuXFpXch6962hs7nSmKgodDczTUevrCYK',NULL,NULL,'2026-08-08 14:31:49','2026-08-08 14:31:49'),(29,'DC-9629','teju','teju@123',NULL,NULL,NULL,NULL,'Doctor','$2b$10$RXt9WSHA3pHDJbnXZsHQqun.gDQcbkgExU7i/4kRnZCYK34JwRywq',NULL,NULL,'2026-08-08 14:37:24','2026-08-10 08:50:37'),(100,'AD-1001','Tejaswini','tejaswini@clinic.com','9876543210',NULL,NULL,NULL,'Admin','$2b$10$7PtmQxmKA9.ouLFyLz4Co.yhgwhQKpxaybwm73BeVLmDLYYT6Luoq',NULL,NULL,'2026-08-08 15:54:12','2026-08-10 09:36:23'),(101,'DC-5390','rajesh.kumar','rajesh.kumar@smilecare.com',NULL,NULL,NULL,NULL,'Doctor','$2b$10$/GCZfAsCYFUc6fMA9VHh0O4DnMahRQnHp8qk7MK/2Lh2M/9E2vhNi',NULL,NULL,'2026-08-08 23:43:36','2026-08-08 23:43:36'),(102,'PT-6138','tejaswini.patient','tejaswini.patient@gmail.com',NULL,NULL,NULL,NULL,'Patient','$2b$10$tPZ/yhgRaucePsEt5TwXdutBsZ61IA3Coxrn9HlQDtz1e/8jFDaVS',NULL,NULL,'2026-08-10 09:36:24','2026-08-10 09:36:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vendor_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'MediSupply India','9000011111','orders@medisupply.in'),(2,'DentoCare Supplies','9000022222','anita@dentocare.com'),(3,'OrthoWorld India','9000033333','pradeep@orthoworld.in');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_consumables`
--

DROP TABLE IF EXISTS `visit_consumables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_consumables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `visit_id` bigint unsigned NOT NULL,
  `appointment_id` bigint unsigned DEFAULT NULL,
  `doctor_id` bigint unsigned DEFAULT NULL,
  `item_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty_used` int NOT NULL DEFAULT '0',
  `source` enum('AUTO','MANUAL','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AUTO',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vc_visit` (`visit_id`),
  KEY `idx_vc_appt` (`appointment_id`),
  KEY `idx_vc_doctor` (`doctor_id`),
  KEY `idx_vc_item` (`item_code`),
  KEY `idx_vc_created` (`created_at`),
  CONSTRAINT `fk_vc_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vc_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vc_visit` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_consumables`
--

LOCK TABLES `visit_consumables` WRITE;
/*!40000 ALTER TABLE `visit_consumables` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_consumables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_procedures`
--

DROP TABLE IF EXISTS `visit_procedures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_procedures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `visit_id` bigint unsigned NOT NULL,
  `procedure_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tooth` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surface` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qty` int NOT NULL DEFAULT '1',
  `predicted_duration_min` int DEFAULT NULL,
  `actual_duration_min` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_json` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vp_visit` (`visit_id`),
  KEY `idx_vp_code` (`procedure_code`),
  CONSTRAINT `fk_vp_visit` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_procedures`
--

LOCK TABLES `visit_procedures` WRITE;
/*!40000 ALTER TABLE `visit_procedures` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_procedures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `visit_uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointment_id` bigint unsigned DEFAULT NULL,
  `linked_case_id` bigint unsigned DEFAULT NULL,
  `patient_id` bigint unsigned NOT NULL,
  `doctor_id` bigint unsigned NOT NULL,
  `status` enum('OPEN','CLOSED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `chief_complaint` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clinical_notes` text COLLATE utf8mb4_unicode_ci,
  `diagnosis_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `procedures_json` longtext COLLATE utf8mb4_unicode_ci,
  `vitals_json` longtext COLLATE utf8mb4_unicode_ci,
  `findings_json` longtext COLLATE utf8mb4_unicode_ci,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_visits_uid` (`visit_uid`),
  KEY `idx_visits_appt` (`appointment_id`),
  KEY `idx_visits_case` (`linked_case_id`),
  KEY `idx_visits_patient` (`patient_id`),
  KEY `idx_visits_doctor` (`doctor_id`),
  KEY `idx_visits_status` (`status`),
  KEY `idx_visits_created` (`created_at`),
  CONSTRAINT `fk_visits_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visits_case` FOREIGN KEY (`linked_case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_visits_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_visits_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10  9:38:44
