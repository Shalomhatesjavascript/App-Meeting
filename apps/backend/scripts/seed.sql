-- Seed data for BU Connect D1 database.
-- Safe to run multiple times: most inserts use INSERT OR IGNORE and guarded subqueries.

-- Interests catalog
INSERT OR IGNORE INTO interests (name) VALUES
  ('Reading'),
  ('Coding'),
  ('Music'),
  ('Photography'),
  ('Fitness'),
  ('Movies'),
  ('Gaming'),
  ('Cooking'),
  ('Art & Design'),
  ('Travel'),
  ('Debate'),
  ('Sports'),
  ('Entrepreneurship'),
  ('Writing'),
  ('Fashion'),
  ('Data Science'),
  ('Volunteering'),
  ('Dance'),
  ('Faith & Spirituality'),
  ('Poetry');

-- Users (password_hash is placeholder text for seeded demo accounts)
INSERT OR IGNORE INTO users (email, password_hash, role, is_verified, is_banned, is_approved, created_at)
VALUES
  ('amara.okafor@student.babcock.edu.ng', 'seeded_hash_1', 'free', 1, 0, 1, datetime('now')),
  ('chibuike.eze@student.babcock.edu.ng', 'seeded_hash_2', 'premium', 1, 0, 1, datetime('now')),
  ('zara.adeyemi@student.babcock.edu.ng', 'seeded_hash_3', 'free', 1, 0, 1, datetime('now')),
  ('tunde.fashola@student.babcock.edu.ng', 'seeded_hash_4', 'premium', 1, 0, 1, datetime('now')),
  ('nkechi.obi@student.babcock.edu.ng', 'seeded_hash_5', 'free', 1, 0, 1, datetime('now')),
  ('emeka.nwosu@student.babcock.edu.ng', 'seeded_hash_6', 'free', 1, 0, 1, datetime('now')),
  ('admin@babcock.edu.ng', 'seeded_admin_hash', 'admin', 1, 0, 1, datetime('now'));

-- Profiles
INSERT OR REPLACE INTO profiles (user_id, full_name, alias, gender, department, level, bio, intent, is_id_verified)
SELECT id, 'Amara Okafor', 'Amara', 'female', 'Computer Science', 300,
  'Final year CS student who loves hackathons and building things that matter.',
  'study buddy', 1
FROM users WHERE email = 'amara.okafor@student.babcock.edu.ng';

INSERT OR REPLACE INTO profiles (user_id, full_name, alias, gender, department, level, bio, intent, is_id_verified)
SELECT id, 'Chibuike Eze', 'Chibuike', 'male', 'Mass Communication', 200,
  'Storyteller and photographer documenting campus life one frame at a time.',
  'friendship', 1
FROM users WHERE email = 'chibuike.eze@student.babcock.edu.ng';

INSERT OR REPLACE INTO profiles (user_id, full_name, alias, gender, department, level, bio, intent, is_id_verified)
SELECT id, 'Zara Adeyemi', 'Zara', 'female', 'Psychology', 400,
  'Future clinical psychologist and part-time poet.',
  'networking', 1
FROM users WHERE email = 'zara.adeyemi@student.babcock.edu.ng';

INSERT OR REPLACE INTO profiles (user_id, full_name, alias, gender, department, level, bio, intent, is_id_verified)
SELECT id, 'Tunde Fashola', 'Tunde', 'male', 'Business Administration', 300,
  'Entrepreneur in the making and always up for a thoughtful conversation.',
  'dating', 0
FROM users WHERE email = 'tunde.fashola@student.babcock.edu.ng';

INSERT OR REPLACE INTO profiles (user_id, full_name, alias, gender, department, level, bio, intent, is_id_verified)
SELECT id, 'Nkechi Obi', 'Nkechi', 'female', 'Biochemistry', 500,
  'Medical biochem nerd surviving on coffee and determination.',
  'study buddy', 1
FROM users WHERE email = 'nkechi.obi@student.babcock.edu.ng';

INSERT OR REPLACE INTO profiles (user_id, full_name, alias, gender, department, level, bio, intent, is_id_verified)
SELECT id, 'Emeka Nwosu', 'Emeka', 'male', 'Electrical Engineering', 400,
  'Engineering by day, music producer by night.',
  'friendship', 1
FROM users WHERE email = 'emeka.nwosu@student.babcock.edu.ng';

-- User interests
INSERT OR IGNORE INTO user_interests (user_id, interest_id)
SELECT u.id, i.id
FROM users u
JOIN interests i ON i.name IN ('Coding', 'Reading', 'Entrepreneurship', 'Music')
WHERE u.email = 'amara.okafor@student.babcock.edu.ng';

INSERT OR IGNORE INTO user_interests (user_id, interest_id)
SELECT u.id, i.id
FROM users u
JOIN interests i ON i.name IN ('Photography', 'Writing', 'Music', 'Movies')
WHERE u.email = 'chibuike.eze@student.babcock.edu.ng';

INSERT OR IGNORE INTO user_interests (user_id, interest_id)
SELECT u.id, i.id
FROM users u
JOIN interests i ON i.name IN ('Poetry', 'Debate', 'Faith & Spirituality', 'Reading')
WHERE u.email = 'zara.adeyemi@student.babcock.edu.ng';

INSERT OR IGNORE INTO user_interests (user_id, interest_id)
SELECT u.id, i.id
FROM users u
JOIN interests i ON i.name IN ('Entrepreneurship', 'Cooking', 'Sports', 'Fitness')
WHERE u.email = 'tunde.fashola@student.babcock.edu.ng';

INSERT OR IGNORE INTO user_interests (user_id, interest_id)
SELECT u.id, i.id
FROM users u
JOIN interests i ON i.name IN ('Reading', 'Data Science', 'Music', 'Art & Design')
WHERE u.email = 'nkechi.obi@student.babcock.edu.ng';

INSERT OR IGNORE INTO user_interests (user_id, interest_id)
SELECT u.id, i.id
FROM users u
JOIN interests i ON i.name IN ('Music', 'Coding', 'Fitness', 'Gaming')
WHERE u.email = 'emeka.nwosu@student.babcock.edu.ng';

-- Likes and matches for seeded conversations
INSERT OR IGNORE INTO likes (from_user_id, to_user_id, is_like, created_at)
SELECT u1.id, u2.id, 1, datetime('now', '-2 day')
FROM users u1, users u2
WHERE u1.email = 'amara.okafor@student.babcock.edu.ng'
  AND u2.email = 'chibuike.eze@student.babcock.edu.ng';

INSERT OR IGNORE INTO likes (from_user_id, to_user_id, is_like, created_at)
SELECT u1.id, u2.id, 1, datetime('now', '-2 day')
FROM users u1, users u2
WHERE u1.email = 'chibuike.eze@student.babcock.edu.ng'
  AND u2.email = 'amara.okafor@student.babcock.edu.ng';

INSERT INTO matches (user1_id, user2_id, created_at)
SELECT u1.id, u2.id, datetime('now', '-1 day')
FROM users u1, users u2
WHERE u1.email = 'amara.okafor@student.babcock.edu.ng'
  AND u2.email = 'chibuike.eze@student.babcock.edu.ng'
  AND NOT EXISTS (
    SELECT 1 FROM matches m
    WHERE (m.user1_id = u1.id AND m.user2_id = u2.id)
       OR (m.user1_id = u2.id AND m.user2_id = u1.id)
  );

INSERT INTO matches (user1_id, user2_id, created_at)
SELECT u1.id, u2.id, datetime('now', '-3 day')
FROM users u1, users u2
WHERE u1.email = 'amara.okafor@student.babcock.edu.ng'
  AND u2.email = 'zara.adeyemi@student.babcock.edu.ng'
  AND NOT EXISTS (
    SELECT 1 FROM matches m
    WHERE (m.user1_id = u1.id AND m.user2_id = u2.id)
       OR (m.user1_id = u2.id AND m.user2_id = u1.id)
  );

-- Seed a few messages in existing matches if no messages exist yet for those pairs
INSERT INTO messages (match_id, sender_id, content, is_read, created_at)
SELECT m.id, u1.id, 'Hey! I saw you are into photography too.', 1, datetime('now', '-20 hour')
FROM matches m
JOIN users u1 ON u1.email = 'chibuike.eze@student.babcock.edu.ng'
JOIN users a ON a.email = 'amara.okafor@student.babcock.edu.ng'
WHERE ((m.user1_id = u1.id AND m.user2_id = a.id) OR (m.user1_id = a.id AND m.user2_id = u1.id))
  AND NOT EXISTS (SELECT 1 FROM messages x WHERE x.match_id = m.id);

INSERT INTO messages (match_id, sender_id, content, is_read, created_at)
SELECT m.id, a.id, 'Yes! We should do a photowalk around campus this weekend.', 0, datetime('now', '-18 hour')
FROM matches m
JOIN users u1 ON u1.email = 'chibuike.eze@student.babcock.edu.ng'
JOIN users a ON a.email = 'amara.okafor@student.babcock.edu.ng'
WHERE ((m.user1_id = u1.id AND m.user2_id = a.id) OR (m.user1_id = a.id AND m.user2_id = u1.id))
  AND EXISTS (SELECT 1 FROM messages x WHERE x.match_id = m.id)
  AND NOT EXISTS (
    SELECT 1 FROM messages x WHERE x.match_id = m.id AND x.content LIKE 'Yes! We should do a photowalk%'
  );

INSERT OR IGNORE INTO admin_logs (admin_id, action, target_user_id, timestamp)
SELECT admin.id, 'Seeded demo data', NULL, datetime('now')
FROM users admin
WHERE admin.email = 'admin@babcock.edu.ng';
