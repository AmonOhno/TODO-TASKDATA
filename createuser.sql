create database prisma_db charset utf8;
create user prisma_user@localhost identified by 'prisma_pass';
grant all privileges on prisma_db.* to prisma_user@localhost;
grant all create, alter, drop, references on *.* to prisma_user@localhost;
-- https://zenn.dev/tatsuyasusukida/articles/why-prisma-migrate-dev-fails-in-myql