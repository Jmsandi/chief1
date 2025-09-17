-- Update existing cars with placeholder images
UPDATE public.cars SET image_url = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop&crop=center' WHERE model = 'Toyota Camry';
UPDATE public.cars SET image_url = 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=300&fit=crop&crop=center' WHERE model = 'Honda CR-V';
UPDATE public.cars SET image_url = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop&crop=center' WHERE model = 'BMW 3 Series';

-- Add more sample cars if they don't exist
INSERT INTO public.cars (model, type, price_per_hour, description, features, image_url) 
SELECT 'Mercedes C-Class', 'Luxury', 45.00, 'Elegant luxury sedan with premium amenities', ARRAY['Leather Seats', 'Premium Sound', 'GPS Navigation', 'Climate Control'], 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop&crop=center'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE model = 'Mercedes C-Class');

INSERT INTO public.cars (model, type, price_per_hour, description, features, image_url) 
SELECT 'Tesla Model 3', 'Electric', 40.00, 'Cutting-edge electric vehicle with autopilot', ARRAY['Electric', 'Autopilot', 'Premium Interior', 'Fast Charging'], 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=300&fit=crop&crop=center'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE model = 'Tesla Model 3');

INSERT INTO public.cars (model, type, price_per_hour, description, features, image_url) 
SELECT 'Ford Explorer', 'SUV', 30.00, 'Spacious family SUV perfect for road trips', ARRAY['7 Seater', 'All-Wheel Drive', 'Cargo Space', 'Safety Features'], 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop&crop=center'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE model = 'Ford Explorer');