INSERT INTO users (name, email, password_hash, role, student_id)
VALUES (
  'Admin User',
  'admin@smartcanteen.local',
  '$2a$10$3.OjKmJqOe.1130GvnJdWeAjjRLPUJbgp8nmUJLEEJW3mUJmwsn22',
  'admin',
  'ADMIN-001'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO menu_items (name, description, price, category, image, is_available)
VALUES
  ('Veg Sandwich', 'Grilled bread, veggies, mint chutney', 40.00, 'Snacks', '🥪', TRUE),
  ('Samosa (2 pcs)', 'Crisp pastry, spiced potato filling', 20.00, 'Snacks', '🥟', TRUE),
  ('Veg Cutlet', 'Pan-fried mixed vegetable patty', 35.00, 'Snacks', '🧆', FALSE),
  ('Veg Thali', 'Rice, dal, sabzi, roti, salad', 90.00, 'Meals', '🍛', TRUE),
  ('Rice & Dal Combo', 'Steamed rice with tadka dal', 70.00, 'Meals', '🍚', TRUE),
  ('Chole Bhature', 'Spiced chickpeas, fried bread', 80.00, 'Meals', '🫓', FALSE),
  ('Cold Coffee', 'Chilled, blended, lightly sweet', 50.00, 'Beverages', '🥤', TRUE),
  ('Masala Chai', 'Spiced milk tea, served hot', 15.00, 'Beverages', '☕', TRUE),
  ('Fresh Lime Soda', 'Sweet or salted, made fresh', 30.00, 'Beverages', '🍋', TRUE),
  ('Veg Burger', 'Grilled patty, lettuce, mayo', 60.00, 'Fast Food', '🍔', TRUE),
  ('French Fries', 'Salted, crisp, served hot', 50.00, 'Fast Food', '🍟', TRUE),
  ('Veg Noodles', 'Stir-fried noodles, mixed vegetables', 70.00, 'Fast Food', '🍜', TRUE),
  ('Cheese Pizza Slice', 'Wood-fired base, extra cheese', 65.00, 'Fast Food', '🍕', FALSE),
  ('Sandwich + Coffee', 'Veg sandwich with a cold coffee', 80.00, 'Combos', '🥪', TRUE),
  ('Burger + Fries', 'Veg burger with a side of fries', 100.00, 'Combos', '🍔', TRUE)
ON CONFLICT DO NOTHING;
