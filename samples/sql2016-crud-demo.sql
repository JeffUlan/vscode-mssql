-- SaNagama, 2016
-- Simple CRUD sample to test vscode-msql extension

USE [master]
GO

-- Dump SQL version and current DB (see multiple result sets)
SELECT @@VERSION
SELECT DB_NAME() as CurrentDB
GO

-- Create the a test database
DROP DATABASE IF EXISTS [vscodetestdb];
GO
CREATE DATABASE [vscodetestdb];
GO
ALTER DATABASE [vscodetestdb] SET COMPATIBILITY_LEVEL = 130;
GO

-- Check if the test database was created
SELECT * from sys.databases;
GO

USE [vscodetestdb];
SELECT DB_NAME() as CurrentDB
GO

-- Create a test table
CREATE TABLE [dbo].[Customers]
(
 [CustId] [int] NOT NULL,
 [FirstName] [nvarchar](50) NOT NULL,
 [LastName] [nvarchar](50) NOT NULL,
 [Email] [nvarchar](50) NOT NULL,

 PRIMARY KEY CLUSTERED ([CustId] ASC) ON [PRIMARY]
);
GO

-- Dump records (note that we don't have any records yet)
SELECT * FROM Customers;
GO

-- Insert sample data into table
INSERT INTO [dbo].[Customers]([CustId],[FirstName],[LastName],[Email])
VALUES
(1, 'Amitabh', 'Bachchan', 'angry_young_man@gmail.com'),
(2, 'Abhishek', 'Bachchan', 'abhishek@abhishekbachchan.org'),
(3, 'Aishwarya', 'Rai', 'ash@gmail.com'),
(4, 'Aamir', 'Khan', 'aamir@khan.com')
GO

-- Dump records (we should have 4 records now)
SELECT * FROM Customers;
GO

-- Update 2 records
UPDATE Customers
SET Email = 'bachchans@gmail.com'
WHERE LastName = 'Bachchan'
GO

-- Dump records (see that 2 e-mail addresses have been updated)
SELECT * FROM Customers;
GO

-- Delete a record
DELETE FROM Customers
WHERE CustId = 4
GO

-- Dump records (note that we only have 3 records now)
SELECT * FROM Customers;
GO