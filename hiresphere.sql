/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `roadmap_progress`;
CREATE TABLE `roadmap_progress` (
  `user_id` varchar(255) NOT NULL,
  `roadmap_id` int NOT NULL,
  `liked` tinyint(1) DEFAULT '0',
  `completed_steps` json NOT NULL,
  PRIMARY KEY (`user_id`,`roadmap_id`),
  KEY `roadmap_id` (`roadmap_id`),
  KEY `idx_roadmap_progress_user_id_roadmap_id` (`user_id`,`roadmap_id`),
  CONSTRAINT `roadmap_progress_ibfk_1` FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `roadmaps`;
CREATE TABLE `roadmaps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `year` int DEFAULT NULL,
  `ai_generated` tinyint(1) DEFAULT '0',
  `created_by` varchar(255) NOT NULL,
  `steps` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `likes` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_roadmaps_created_at` (`created_at`),
  KEY `idx_roadmaps_id` (`id`),
  CONSTRAINT `roadmaps_chk_1` CHECK (((`year` >= 1) and (`year` <= 4)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `success_stories`;
CREATE TABLE `success_stories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `post` varchar(255) NOT NULL,
  `batch` year NOT NULL,
  `followed_roadmap` varchar(250) NOT NULL,
  `connect_link` varchar(255) NOT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roadmap_progress` (`user_id`, `roadmap_id`, `liked`, `completed_steps`) VALUES
('user_2wUnWOmAphmVJsIj7alUhSAV7mB', 2, 0, '[0, 1]');


INSERT INTO `roadmaps` (`id`, `title`, `year`, `ai_generated`, `created_by`, `steps`, `created_at`, `likes`) VALUES
(2, 'Web Development Roadmap', 1, 0, 'user1', '[{\"link\": \"https://developer.mozilla.org/en-US/docs/Web/HTML\", \"title\": \"Learn HTML\", \"bullets\": [\"Understand tags\", \"Create a webpage\"]}, {\"title\": \"Learn CSS\", \"bullets\": [\"Style elements\", \"Use Flexbox\"]}]', '2025-05-01 17:12:23', 0);
INSERT INTO `roadmaps` (`id`, `title`, `year`, `ai_generated`, `created_by`, `steps`, `created_at`, `likes`) VALUES
(3, 'Data Science Roadmap', 2, 1, 'user2', '[{\"link\": \"https://www.python.org\", \"title\": \"Learn Python\", \"bullets\": [\"Master syntax\", \"Use pandas\"]}, {\"title\": \"Statistics\", \"bullets\": [\"Probability basics\", \"Regression analysis\"]}]', '2025-05-01 17:12:23', 0);
INSERT INTO `roadmaps` (`id`, `title`, `year`, `ai_generated`, `created_by`, `steps`, `created_at`, `likes`) VALUES
(4, 'Mobile App Development', 3, 0, 'user1', '[{\"link\": \"https://flutter.dev\", \"title\": \"Learn Flutter\", \"bullets\": [\"Set up Dart\", \"Build UI\"]}, {\"title\": \"API Integration\", \"bullets\": [\"Use REST APIs\", \"Handle JSON\"]}]', '2025-05-01 17:12:24', 0);
INSERT INTO `roadmaps` (`id`, `title`, `year`, `ai_generated`, `created_by`, `steps`, `created_at`, `likes`) VALUES
(5, 'Cybersecurity Basics', 4, 0, 'user3', '[{\"title\": \"Network Security\", \"bullets\": [\"Learn TCP/IP\", \"Understand firewalls\"]}, {\"link\": \"https://www.kali.org\", \"title\": \"Ethical Hacking\", \"bullets\": [\"Use Kali Linux\", \"Perform penetration testing\"]}]', '2025-05-01 17:12:24', 0),
(6, 'Machine Learning Roadmap', 2, 1, 'user2', '[{\"title\": \"Linear Algebra\", \"bullets\": [\"Vectors and matrices\", \"Eigenvalues\"]}, {\"link\": \"https://www.tensorflow.org\", \"title\": \"TensorFlow\", \"bullets\": [\"Build neural networks\", \"Train models\"]}]', '2025-05-01 17:12:24', 0),
(10, 'Web Dev', 1, 1, 'user_330UAaY5UvgGcWj1ySf2NgbeO9Z', '[{\"link\": \"https://www.freecodecamp.org/learn/\", \"title\": \"Learn HTML, CSS, and Basic JavaScript\", \"bullets\": [\"Master the fundamentals of HTML for structuring web pages, CSS for styling them, and JavaScript for adding interactivity.\", \"Practice building simple websites (e.g., a personal portfolio, a simple to-do list) to solidify your understanding.\", \"Familiarize yourself with developer tools in your browser (like Chrome DevTools) to inspect and debug your code.\"]}, {\"link\": \"https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design\", \"title\": \"Understand Responsive Web Design Principles\", \"bullets\": [\"Learn about different viewport sizes and how to design websites that adapt to various screen sizes (desktops, tablets, mobile).\", \"Explore responsive design techniques like using CSS media queries and flexible layouts (Grid and Flexbox).\", \"Practice building responsive websites to ensure your projects are accessible across all devices.\"]}, {\"link\": \"https://reactjs.org/tutorial/tutorial.html\", \"title\": \"Explore a JavaScript Framework/Library (React, Vue, or Angular)\", \"bullets\": [\"Choose one popular framework (React is a good starting point) and learn its core concepts and syntax.\", \"Build small projects using the chosen framework to gain practical experience and build your portfolio.\", \"Understand component-based architecture and state management within the framework.\"]}]', '2025-09-21 17:09:41', 0);

INSERT INTO `success_stories` (`id`, `name`, `post`, `batch`, `followed_roadmap`, `connect_link`, `image_url`, `created_at`) VALUES
(1, 'Aarav Kulkarni', 'Backend Engineer at Google', '2021', 'Web Development', 'mailto:aarav.kulkarni@example.com', 'https://picsum.photos/400/300', '2025-09-21 17:16:28');
INSERT INTO `success_stories` (`id`, `name`, `post`, `batch`, `followed_roadmap`, `connect_link`, `image_url`, `created_at`) VALUES
(2, 'Priya Deshmukh', 'Frontend Developer at Facebook', '2022', 'Mobile App Development', 'mailto:priya.deshmukh@example.com', 'https://picsum.photos/400/300', '2025-09-21 17:16:28');
INSERT INTO `success_stories` (`id`, `name`, `post`, `batch`, `followed_roadmap`, `connect_link`, `image_url`, `created_at`) VALUES
(3, 'Rohan Patil', 'Data Scientist at Amazon', '2020', 'Cybersecurity Essentials', 'mailto:rohan.patil@example.com', 'https://picsum.photos/400/300', '2025-09-21 17:16:28');
INSERT INTO `success_stories` (`id`, `name`, `post`, `batch`, `followed_roadmap`, `connect_link`, `image_url`, `created_at`) VALUES
(4, 'Ananya More', 'Product Manager at Microsoft', '2021', 'AI Engineering', 'mailto:ananya.more@example.com', 'https://picsum.photos/400/300', '2025-09-21 17:16:28'),
(5, 'Siddhesh Shinde', 'Security Analyst at Apple', '2022', 'Cloud Computing', 'mailto:siddhesh.shinde@example.com', 'https://picsum.photos/400/300', '2025-09-21 17:16:28'),
(6, 'omkar kulkarni', 'Software Engineer @Google', '2024', 'Web Dev', 'mailto:omkar.kulkarni.3174@gmail.com', 'https://i.insider.com/63ca78a6eee94d001a791149?width=700', '2025-09-21 17:30:28');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;