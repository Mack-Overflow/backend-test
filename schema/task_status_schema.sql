CREATE TABLE task_statuses (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    task_id INT(11) NOT NULL,
    task_complete BOOLEAN NOT NULL
) ENGINE=INNODB;
