-- Insert Tony Stark into account

INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
) VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

--Update Tony Stark's account to Admin

UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete Tony Stark from the table 

DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';


-- Inner Join for inventory items that belong to Sport categoty

SELECT i.inv_make,
       i.inv_model,
       c.classification_name
FROM public.inventory i
INNER JOIN public.classification c
       ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
