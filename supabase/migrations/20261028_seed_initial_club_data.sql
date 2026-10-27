begin;

-- Seed des départements
insert into public.departments (id, act, title, color, accent, copy, chips, visual, display_order)
values
  ('technical', 'Act II · Grow', 'Technical', '#dce9ff', '#4285f4', 'Turn questions into working products. Learn by shipping, debugging and sharing what you discover.', '["Web Dev", "Mobile Dev", "AI", "IoT"]'::jsonb, 'technical', 1),
  ('marketing', 'Act III · Create', 'Marketing', '#ffe1dd', '#ea4335', 'Give great ideas a voice and a visual world. Shape stories people want to see, feel and share.', '["UI / UX", "Graphic Design", "Video Editing", "3D"]'::jsonb, 'marketing', 2),
  ('communication', 'Act I · Inspire', 'Communication', '#fff0b5', '#fbbc05', 'Build the confidence to connect. Speak with clarity, listen with purpose and open doors for others.', '["Soft Skills", "CV / LinkedIn / Portfolio", "Debates"]'::jsonb, 'communication', 3)
on conflict (id) do update set
  act = excluded.act,
  title = excluded.title,
  color = excluded.color,
  accent = excluded.accent,
  copy = excluded.copy,
  chips = excluded.chips,
  visual = excluded.visual,
  display_order = excluded.display_order;

-- Seed des statistiques clés
insert into public.site_stats (id, value, suffix, label, display_order)
values
  ('members', 60, '+', 'active members', 1),
  ('workshops', 15, '+', 'workshops delivered', 2),
  ('certificates', 100, '+', 'certificats', 3),
  ('collaborations', 2, '+', 'collaborations', 4)
on conflict (id) do update set
  value = excluded.value,
  suffix = excluded.suffix,
  label = excluded.label,
  display_order = excluded.display_order;

-- Seed des réglages du site
insert into public.site_settings (id, applications_open, applications_closed_message, contact_email, instagram_url, linkedin_url, facebook_url, mission_text)
values (
  'current',
  true,
  'Applications are currently closed. Follow our social channels to know when the next cycle opens!',
  'hello@isitcomgoogleclub.tn',
  'https://www.instagram.com/isitcomgoogleclub2/',
  'https://www.linkedin.com/company/isitcom-google-club/',
  '',
  'We bring curious students together to learn practical skills, share brave ideas, and create projects that make campus life more connected.'
)
on conflict (id) do update set
  contact_email = excluded.contact_email,
  instagram_url = excluded.instagram_url,
  linkedin_url = excluded.linkedin_url,
  mission_text = excluded.mission_text;

-- Seed de l'équipe (Bureau)
insert into public.team_members (name, role, department_id, color, initials, featured, display_order, linkedin_url, email)
values
  ('Mohamed Khalil Ayadhi', 'President', 'executive', '#4285f4', 'MK', true, 1, 'https://www.linkedin.com/in/mohamed-khalil-ayadhi/', 'khalilayadhi27@gmail.com'),
  ('Mariem Baccouche', 'Vice President', 'executive', '#34a853', 'MB', true, 2, '', ''),
  ('Dana Chebbi', 'HR Manager', 'executive', '#ea4335', 'DC', false, 3, '', ''),
  ('Yosri Meftah', 'Tech Manager', 'technical', '#4285f4', 'YM', false, 4, '', ''),
  ('Ayoub Rouatbi', 'Tech Assistant', 'technical', '#4285f4', 'AR', false, 5, '', ''),
  ('Safa Hmida', 'Tech Assistant', 'technical', '#4285f4', 'SH', false, 6, '', ''),
  ('Khaireddine Laadhari', 'Marketing Manager', 'marketing-design', '#ea4335', 'KL', false, 7, '', ''),
  ('Chaima Khalfallah', 'Design Manager', 'marketing-design', '#ea4335', 'CK', false, 8, '', ''),
  ('Maryem Omri', 'Media Manager', 'marketing-design', '#ea4335', 'MO', false, 9, '', ''),
  ('Emna Souelmi', 'Media Assistant', 'marketing-design', '#ea4335', 'ES', false, 10, '', ''),
  ('Haithem Abid', 'Communication Manager', 'communication', '#fbbc05', 'HA', false, 11, '', ''),
  ('Sirine Ghodhben', 'Communication Assistant', 'communication', '#fbbc05', 'SG', false, 12, '', ''),
  ('Mohamed Amine Bziouech', 'Communication Assistant', 'communication', '#fbbc05', 'MA', false, 13, '', ''),
  ('Salma Gunenna', 'Event Manager', 'events-organisation', '#34a853', 'SG', false, 14, '', ''),
  ('Tasnim Ben Trad', 'Organisation Manager', 'events-organisation', '#34a853', 'TB', false, 15, '', '')
on conflict do nothing;

-- Seed des événements initiaux
insert into public.events (type, title, tag, desc_text, art, color, display_order)
values
  ('upcoming', 'Open Day', 'Community', 'Team building activities and meetups', 'HI', '#a8c7fa', 1),
  ('upcoming', 'Interview', 'Communication', 'Enhance your public speaking and debate skills', '//', '#ffb4ab', 2),
  ('upcoming', 'Workshops', 'Workshop', 'AI / WEB / IOT / Video editing / graphic designing', 'WORK', '#a8dab5', 3),
  ('past', 'Birthday Party', 'Community', 'It''s our birthday. Come celebrate with us.', 'BIRTHDAY', '#ffe083', 4),
  ('past', 'Football tournement', 'Workshop', 'Come and enjoy the tournament with your friends.', '</>', '#a8c7fa', 5),
  ('past', 'Hackathon Participation', 'hackathon', 'We participated in the hackathon and we are proud of ourselves.', '//', '#ffe083', 6)
on conflict do nothing;

-- Seed de la galerie
insert into public.gallery_images (label, alt, image_url, display_order)
values
  ('Birthday celebration', 'Club members celebrating together', '', 1),
  ('Certified achievement', 'Club members holding their participation certificates', '', 2),
  ('Collaboration meetup', 'Club members meeting together', '', 3),
  ('Workshop moments', 'Students attending a club workshop', '', 4)
on conflict do nothing;

notify pgrst, 'reload schema';

commit;
