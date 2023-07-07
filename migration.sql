CREATE TABLE `subscription_flat` (
  `login` bigint unsigned NOT NULL COMMENT 'trader account',
  `r_login` bigint unsigned NOT NULL COMMENT 'investor account',
  `balance_usd` int NOT NULL,
  KEY `r_login` (`balance_usd`),
  KEY `login_r_login` (`login`,`r_login`) USING BTREE,
  KEY `login` (`balance_usd`)
) ENGINE=InnoDB

#так же вспомнил поздно, что упустил source( искал просто по логинам

ALTER TABLE `account` DROP INDEX `login`, ADD INDEX `login` (`login`) USING BTREE;

#вспомнил поздно, что хорошо бы добавить индексы login balance чтобы еще быстрее искать связки login balance

ALTER TABLE `account` ADD `subscribers_count` INT AFTER `balance_usd_sub`;

