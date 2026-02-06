-- Seed starter maths content (topics, lessons, questions)
-- Safe to run multiple times; uses WHERE NOT EXISTS checks.

begin;

-- Subject (Maths)
insert into public.subjects (id, slug, title)
select gen_random_uuid(), 'maths', 'Maths'
where not exists (select 1 from public.subjects where slug = 'maths');

-- Subject (English placeholder)
insert into public.subjects (id, slug, title)
select gen_random_uuid(), 'english', 'English'
where not exists (select 1 from public.subjects where slug = 'english');

-- Levels (handles schemas with or without a title column)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'levels'
      and column_name = 'title'
  ) then
    insert into public.levels (id, code, title, sort_order)
    select gen_random_uuid(), v.code, v.title, v.sort_order
    from (values
      ('E1', 'Entry 1', 1),
      ('E2', 'Entry 2', 2),
      ('E3', 'Entry 3', 3)
    ) as v(code, title, sort_order)
    where not exists (select 1 from public.levels l where l.code = v.code);
  else
    insert into public.levels (id, code, sort_order)
    select gen_random_uuid(), v.code, v.sort_order
    from (values
      ('E1', 1),
      ('E2', 2),
      ('E3', 3)
    ) as v(code, sort_order)
    where not exists (select 1 from public.levels l where l.code = v.code);
  end if;
end $$;

-- Topics
insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Number', 'Place value and number basics.', 1
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E1'
  and not exists (select 1 from public.topics t where t.title = 'Number' and t.level_id = l.id);

insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Money', 'Totals and change with money.', 2
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E1'
  and not exists (select 1 from public.topics t where t.title = 'Money' and t.level_id = l.id);

insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Fractions', 'Equivalent fractions and decimals.', 1
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E2'
  and not exists (select 1 from public.topics t where t.title = 'Fractions' and t.level_id = l.id);

insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Measures', 'Metric units and perimeter/area.', 2
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E2'
  and not exists (select 1 from public.topics t where t.title = 'Measures' and t.level_id = l.id);

insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Ratio & Percentages', 'Ratios, scale and percentage change.', 1
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E3'
  and not exists (select 1 from public.topics t where t.title = 'Ratio & Percentages' and t.level_id = l.id);

-- Lessons
insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Place value',
'### Place value\nUnderstanding the value of digits in a number.',
1, true
from public.topics t
where t.title = 'Number'
  and not exists (select 1 from public.lessons l where l.title = 'Place value' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Addition and subtraction',
'### Add and subtract\nWork with whole numbers and mental methods.',
2, true
from public.topics t
where t.title = 'Number'
  and not exists (select 1 from public.lessons l where l.title = 'Addition and subtraction' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Money totals',
'### Totals\nAdd costs to find the total.',
1, true
from public.topics t
where t.title = 'Money'
  and not exists (select 1 from public.lessons l where l.title = 'Money totals' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Change',
'### Change\nCalculate change from payments.',
2, true
from public.topics t
where t.title = 'Money'
  and not exists (select 1 from public.lessons l where l.title = 'Change' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Equivalent fractions',
'### Equivalent fractions\nFind fractions that are the same value.',
1, true
from public.topics t
where t.title = 'Fractions'
  and not exists (select 1 from public.lessons l where l.title = 'Equivalent fractions' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Fractions to decimals',
'### Fractions to decimals\nConvert common fractions to decimals.',
2, true
from public.topics t
where t.title = 'Fractions'
  and not exists (select 1 from public.lessons l where l.title = 'Fractions to decimals' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Metric units',
'### Metric units\nKnow common metric conversions.',
1, true
from public.topics t
where t.title = 'Measures'
  and not exists (select 1 from public.lessons l where l.title = 'Metric units' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Perimeter and area',
'### Perimeter and area\nPerimeter is distance around; area is space inside.',
2, true
from public.topics t
where t.title = 'Measures'
  and not exists (select 1 from public.lessons l where l.title = 'Perimeter and area' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Ratios and scale',
'### Ratios and scale\nCompare quantities using ratios and scale.',
1, true
from public.topics t
where t.title = 'Ratio & Percentages'
  and not exists (select 1 from public.lessons l where l.title = 'Ratios and scale' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Percentage change',
'### Percentage change\nFind increases and decreases by a percentage.',
2, true
from public.topics t
where t.title = 'Ratio & Percentages'
  and not exists (select 1 from public.lessons l where l.title = 'Percentage change' and l.topic_id = t.id);

-- Questions + options
-- Place value
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Place value' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'What is the value of the 4 in 3,428?',
    'Look at the hundreds place.',
    'The 4 is in the hundreds place, so it is 400.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'What is the value of the 4 in 3,428?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '4', false from q
union all select gen_random_uuid(), q.id, '40', false from q
union all select gen_random_uuid(), q.id, '400', true from q
union all select gen_random_uuid(), q.id, '4,000', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Place value' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Which number has a 5 in the tens place?',
    'The tens place is the second digit from the right.',
    'In 352, the 5 is in the tens place.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Which number has a 5 in the tens place?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '352', true from q
union all select gen_random_uuid(), q.id, '205', false from q
union all select gen_random_uuid(), q.id, '501', false from q
union all select gen_random_uuid(), q.id, '45', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Place value' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Write 2,000 + 300 + 40 + 5 as a number.',
  'Add each place value together.',
  '2,000 + 300 + 40 + 5 = 2,345.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Write 2,000 + 300 + 40 + 5 as a number.' and lesson_id = l.lesson_id
);

-- Addition and subtraction
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Addition and subtraction' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '58 + 27 = ?',
    'Add tens and ones.',
    '58 + 27 = 85.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '58 + 27 = ?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '75', false from q
union all select gen_random_uuid(), q.id, '85', true from q
union all select gen_random_uuid(), q.id, '95', false from q
union all select gen_random_uuid(), q.id, '105', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Addition and subtraction' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '100 - 47 = ?',
    'Count back or subtract 40 then 7.',
    '100 - 47 = 53.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '100 - 47 = ?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '53', true from q
union all select gen_random_uuid(), q.id, '57', false from q
union all select gen_random_uuid(), q.id, '63', false from q
union all select gen_random_uuid(), q.id, '47', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Addition and subtraction' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Work out 245 + 80.',
  'Add the tens first.',
  '245 + 80 = 325.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Work out 245 + 80.' and lesson_id = l.lesson_id
);

-- Money totals
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Money totals' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '£2.50 + £1.20 = ?',
    'Add pounds and pence.',
    '£2.50 + £1.20 = £3.70.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '£2.50 + £1.20 = ?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '£3.60', false from q
union all select gen_random_uuid(), q.id, '£3.70', true from q
union all select gen_random_uuid(), q.id, '£3.80', false from q
union all select gen_random_uuid(), q.id, '£4.20', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Money totals' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Three items at £1.40 each cost?',
    'Multiply 1.40 by 3.',
    '£1.40 × 3 = £4.20.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Three items at £1.40 each cost?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '£4.20', true from q
union all select gen_random_uuid(), q.id, '£3.20', false from q
union all select gen_random_uuid(), q.id, '£4.40', false from q
union all select gen_random_uuid(), q.id, '£5.20', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Money totals' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Find the total of £5 and £3.75.',
  'Add pounds and pence.',
  '£5 + £3.75 = £8.75.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Find the total of £5 and £3.75.' and lesson_id = l.lesson_id
);

-- Change
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Change' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'You pay £10 for an item costing £6.40. Change = ?',
    '10.00 - 6.40',
    '£10.00 - £6.40 = £3.60.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'You pay £10 for an item costing £6.40. Change = ?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '£3.60', true from q
union all select gen_random_uuid(), q.id, '£4.40', false from q
union all select gen_random_uuid(), q.id, '£2.60', false from q
union all select gen_random_uuid(), q.id, '£6.40', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Change' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'You pay £5 for an item costing £4.15. Change = ?',
    '5.00 - 4.15',
    '£5.00 - £4.15 = £0.85.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'You pay £5 for an item costing £4.15. Change = ?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '£0.85', true from q
union all select gen_random_uuid(), q.id, '£0.95', false from q
union all select gen_random_uuid(), q.id, '£1.15', false from q
union all select gen_random_uuid(), q.id, '£0.15', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Change' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'You pay £20 for an item costing £13.50. Change = ?',
  '20.00 - 13.50',
  '£20.00 - £13.50 = £6.50.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'You pay £20 for an item costing £13.50. Change = ?' and lesson_id = l.lesson_id
);

-- Equivalent fractions
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Equivalent fractions' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Which fraction is equivalent to 1/2?',
    'Multiply top and bottom by the same number.',
    '2/4 is the same as 1/2.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Which fraction is equivalent to 1/2?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '2/4', true from q
union all select gen_random_uuid(), q.id, '1/4', false from q
union all select gen_random_uuid(), q.id, '3/4', false from q
union all select gen_random_uuid(), q.id, '4/2', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Equivalent fractions' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '3/6 simplifies to?',
    'Divide top and bottom by 3.',
    '3/6 = 1/2.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '3/6 simplifies to?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '1/2', true from q
union all select gen_random_uuid(), q.id, '2/3', false from q
union all select gen_random_uuid(), q.id, '3/2', false from q
union all select gen_random_uuid(), q.id, '1/3', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Equivalent fractions' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Write a fraction equivalent to 2/5 with denominator 10.',
  'Multiply top and bottom by 2.',
  '2/5 = 4/10.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Write a fraction equivalent to 2/5 with denominator 10.' and lesson_id = l.lesson_id
);

-- Fractions to decimals
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Fractions to decimals' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '1/4 as a decimal is?',
    'Divide 1 by 4.',
    '1/4 = 0.25.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '1/4 as a decimal is?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '0.25', true from q
union all select gen_random_uuid(), q.id, '0.4', false from q
union all select gen_random_uuid(), q.id, '0.5', false from q
union all select gen_random_uuid(), q.id, '0.75', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Fractions to decimals' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '3/10 as a decimal is?',
    'Divide 3 by 10.',
    '3/10 = 0.3.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '3/10 as a decimal is?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '0.3', true from q
union all select gen_random_uuid(), q.id, '0.03', false from q
union all select gen_random_uuid(), q.id, '0.33', false from q
union all select gen_random_uuid(), q.id, '3.0', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Fractions to decimals' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Write 1/2 as a decimal.',
  '1 ÷ 2 = 0.5.',
  '1/2 = 0.5.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Write 1/2 as a decimal.' and lesson_id = l.lesson_id
);

-- Metric units
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Metric units' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'How many metres are in 1 kilometre?',
    'Kilo means 1000.',
    '1 kilometre = 1000 metres.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'How many metres are in 1 kilometre?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '1000', true from q
union all select gen_random_uuid(), q.id, '100', false from q
union all select gen_random_uuid(), q.id, '10', false from q
union all select gen_random_uuid(), q.id, '1', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Metric units' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '1 litre equals how many millilitres?',
    'A litre is 1000 millilitres.',
    '1 litre = 1000 ml.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '1 litre equals how many millilitres?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '1000', true from q
union all select gen_random_uuid(), q.id, '100', false from q
union all select gen_random_uuid(), q.id, '10', false from q
union all select gen_random_uuid(), q.id, '1', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Metric units' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Convert 2500 g to kg.',
  '1000 g = 1 kg.',
  '2500 g = 2.5 kg.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Convert 2500 g to kg.' and lesson_id = l.lesson_id
);

-- Perimeter and area
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Perimeter and area' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Perimeter of a 5 by 3 rectangle is?',
    'Add all sides: 5+3+5+3.',
    'Perimeter = 16.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Perimeter of a 5 by 3 rectangle is?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '16', true from q
union all select gen_random_uuid(), q.id, '15', false from q
union all select gen_random_uuid(), q.id, '18', false from q
union all select gen_random_uuid(), q.id, '30', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Perimeter and area' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Area of a 4 by 6 rectangle is?',
    'Multiply length by width.',
    'Area = 24.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Area of a 4 by 6 rectangle is?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '24', true from q
union all select gen_random_uuid(), q.id, '10', false from q
union all select gen_random_uuid(), q.id, '20', false from q
union all select gen_random_uuid(), q.id, '28', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Perimeter and area' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Perimeter of a square with side 7 is?',
  'Multiply side by 4.',
  '7 × 4 = 28.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Perimeter of a square with side 7 is?' and lesson_id = l.lesson_id
);

-- Ratios and scale
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Ratios and scale' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'A ratio is 2:3. If the total is 20, how many is the 2 part?',
    'Total parts = 5.',
    'Each part is 4, so 2 parts = 8.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'A ratio is 2:3. If the total is 20, how many is the 2 part?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '8', true from q
union all select gen_random_uuid(), q.id, '10', false from q
union all select gen_random_uuid(), q.id, '12', false from q
union all select gen_random_uuid(), q.id, '14', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Ratios and scale' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'A map scale is 1:100. What does 3 cm represent?',
    'Multiply by 100.',
    '3 cm on the map is 300 cm (3 m) in real life.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'A map scale is 1:100. What does 3 cm represent?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '3 m', true from q
union all select gen_random_uuid(), q.id, '30 cm', false from q
union all select gen_random_uuid(), q.id, '300 m', false from q
union all select gen_random_uuid(), q.id, '3 cm', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Ratios and scale' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Simplify the ratio 6:9.',
  'Divide both parts by 3.',
  '6:9 simplifies to 2:3.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Simplify the ratio 6:9.' and lesson_id = l.lesson_id
);

-- Percentage change
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Percentage change' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '10% of 50 is?',
    '10% means divide by 10.',
    '10% of 50 = 5.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '10% of 50 is?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '5', true from q
union all select gen_random_uuid(), q.id, '10', false from q
union all select gen_random_uuid(), q.id, '15', false from q
union all select gen_random_uuid(), q.id, '50', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Percentage change' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Increase 200 by 10%. What is the new value?',
    '10% of 200 is 20.',
    '200 + 20 = 220.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Increase 200 by 10%. What is the new value?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '220', true from q
union all select gen_random_uuid(), q.id, '210', false from q
union all select gen_random_uuid(), q.id, '200', false from q
union all select gen_random_uuid(), q.id, '230', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Percentage change' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Find 15% of 80.',
  '10% = 8, 5% = 4.',
  '15% of 80 = 12.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Find 15% of 80.' and lesson_id = l.lesson_id
);

-- Additional topics and lessons (expanding content)
-- E1 Time
insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Time', 'Telling time and simple schedules.', 3
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E1'
  and not exists (select 1 from public.topics t where t.title = 'Time' and t.level_id = l.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Telling the time',
'### Telling the time\nRead analogue and digital clocks.',
1, true
from public.topics t
where t.title = 'Time'
  and not exists (select 1 from public.lessons l where l.title = 'Telling the time' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Timetables',
'### Timetables\nWork out start and finish times.',
2, true
from public.topics t
where t.title = 'Time'
  and not exists (select 1 from public.lessons l where l.title = 'Timetables' and l.topic_id = t.id);

-- E2 Graphs
insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Graphs', 'Read and interpret simple charts.', 3
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E2'
  and not exists (select 1 from public.topics t where t.title = 'Graphs' and t.level_id = l.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Reading bar charts',
'### Reading bar charts\nCompare values and totals.',
1, true
from public.topics t
where t.title = 'Graphs'
  and not exists (select 1 from public.lessons l where l.title = 'Reading bar charts' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Line graphs basics',
'### Line graphs basics\nSpot increases and decreases.',
2, true
from public.topics t
where t.title = 'Graphs'
  and not exists (select 1 from public.lessons l where l.title = 'Line graphs basics' and l.topic_id = t.id);

-- E3 Algebra
insert into public.topics (id, subject_id, level_id, title, description, sort_order)
select gen_random_uuid(), s.id, l.id, 'Algebra', 'Expressions and simple equations.', 2
from public.subjects s, public.levels l
where s.slug = 'maths' and l.code = 'E3'
  and not exists (select 1 from public.topics t where t.title = 'Algebra' and t.level_id = l.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Simplifying expressions',
'### Simplifying expressions\nCollect like terms.',
1, true
from public.topics t
where t.title = 'Algebra'
  and not exists (select 1 from public.lessons l where l.title = 'Simplifying expressions' and l.topic_id = t.id);

insert into public.lessons (id, topic_id, title, body, sort_order, published)
select gen_random_uuid(), t.id, 'Solving one-step equations',
'### Solving one-step equations\nUse inverse operations.',
2, true
from public.topics t
where t.title = 'Algebra'
  and not exists (select 1 from public.lessons l where l.title = 'Solving one-step equations' and l.topic_id = t.id);

-- Questions: Telling the time
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Telling the time' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'What is another way to say 3:30?',
    '30 minutes past the hour means half past.',
    '3:30 is half past three.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'What is another way to say 3:30?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, 'Half past three', true from q
union all select gen_random_uuid(), q.id, 'Quarter past three', false from q
union all select gen_random_uuid(), q.id, 'Quarter to three', false from q
union all select gen_random_uuid(), q.id, 'Half past four', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Telling the time' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    '15 minutes past 7 is?',
    '15 minutes past means :15.',
    '15 minutes past 7 is 7:15.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = '15 minutes past 7 is?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '7:15', true from q
union all select gen_random_uuid(), q.id, '7:45', false from q
union all select gen_random_uuid(), q.id, '6:45', false from q
union all select gen_random_uuid(), q.id, '8:15', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Telling the time' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Write “half past 9” as a digital time.',
  'Half past means 30 minutes.',
  'Half past 9 is 9:30.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Write “half past 9” as a digital time.' and lesson_id = l.lesson_id
);

-- Questions: Timetables
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Timetables' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'A bus leaves at 10:05. What time is 20 minutes later?',
    'Add 20 minutes.',
    '10:05 + 20 minutes = 10:25.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'A bus leaves at 10:05. What time is 20 minutes later?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '10:25', true from q
union all select gen_random_uuid(), q.id, '10:15', false from q
union all select gen_random_uuid(), q.id, '10:35', false from q
union all select gen_random_uuid(), q.id, '11:25', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Timetables' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Your lesson starts at 13:40. What is 10 minutes before?',
    'Subtract 10 minutes.',
    '13:40 minus 10 minutes = 13:30.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Your lesson starts at 13:40. What is 10 minutes before?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '13:30', true from q
union all select gen_random_uuid(), q.id, '13:50', false from q
union all select gen_random_uuid(), q.id, '12:30', false from q
union all select gen_random_uuid(), q.id, '13:20', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Timetables' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'A journey starts at 14:15 and lasts 45 minutes. Finish time?',
  'Add 45 minutes.',
  '14:15 + 45 minutes = 15:00.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'A journey starts at 14:15 and lasts 45 minutes. Finish time?' and lesson_id = l.lesson_id
);

-- Questions: Reading bar charts
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Reading bar charts' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'A chart shows apples 12, bananas 8, oranges 10. Which is largest?',
    'Pick the highest number.',
    'Apples at 12 are the largest.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'A chart shows apples 12, bananas 8, oranges 10. Which is largest?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, 'Apples', true from q
union all select gen_random_uuid(), q.id, 'Bananas', false from q
union all select gen_random_uuid(), q.id, 'Oranges', false from q
union all select gen_random_uuid(), q.id, 'All equal', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Reading bar charts' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'How many more apples (12) than bananas (8)?',
    'Find the difference.',
    '12 - 8 = 4 more apples.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'How many more apples (12) than bananas (8)?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '4', true from q
union all select gen_random_uuid(), q.id, '3', false from q
union all select gen_random_uuid(), q.id, '6', false from q
union all select gen_random_uuid(), q.id, '8', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Reading bar charts' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'If the values are 5, 7, and 9, what is the greatest value?',
  'Choose the largest number.',
  'The greatest value is 9.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'If the values are 5, 7, and 9, what is the greatest value?' and lesson_id = l.lesson_id
);

-- Questions: Line graphs basics
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Line graphs basics' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'A value goes from 10 at 9am to 14 at 10am. What is the change?',
    'Subtract start from end.',
    '14 - 10 = 4.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'A value goes from 10 at 9am to 14 at 10am. What is the change?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '4', true from q
union all select gen_random_uuid(), q.id, '3', false from q
union all select gen_random_uuid(), q.id, '5', false from q
union all select gen_random_uuid(), q.id, '6', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Line graphs basics' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Values are 9am = 5, 10am = 7, 11am = 6. Which time is highest?',
    'Pick the largest value.',
    '10am has the highest value (7).',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Values are 9am = 5, 10am = 7, 11am = 6. Which time is highest?' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '10am', true from q
union all select gen_random_uuid(), q.id, '9am', false from q
union all select gen_random_uuid(), q.id, '11am', false from q
union all select gen_random_uuid(), q.id, 'All same', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Line graphs basics' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'A value increases from 3 to 9. What is the increase?',
  'Subtract start from end.',
  '9 - 3 = 6.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'A value increases from 3 to 9. What is the increase?' and lesson_id = l.lesson_id
);

-- Questions: Simplifying expressions
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Simplifying expressions' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Simplify 2a + 3a.',
    'Add the coefficients.',
    '2a + 3a = 5a.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Simplify 2a + 3a.' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '5a', true from q
union all select gen_random_uuid(), q.id, '6a', false from q
union all select gen_random_uuid(), q.id, '5', false from q
union all select gen_random_uuid(), q.id, 'a5', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Simplifying expressions' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Simplify 4x - x.',
    'Subtract the coefficients.',
    '4x - x = 3x.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Simplify 4x - x.' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '3x', true from q
union all select gen_random_uuid(), q.id, '4x', false from q
union all select gen_random_uuid(), q.id, '5x', false from q
union all select gen_random_uuid(), q.id, 'x3', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Simplifying expressions' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Simplify 5y + y.',
  'Add the like terms.',
  '5y + y = 6y.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Simplify 5y + y.' and lesson_id = l.lesson_id
);

-- Questions: Solving one-step equations
with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Solving one-step equations' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Solve x + 7 = 12.',
    'Subtract 7 from both sides.',
    'x = 5.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Solve x + 7 = 12.' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '5', true from q
union all select gen_random_uuid(), q.id, '7', false from q
union all select gen_random_uuid(), q.id, '12', false from q
union all select gen_random_uuid(), q.id, '19', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Solving one-step equations' limit 1
), q as (
  insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
  select gen_random_uuid(), l.topic_id, l.lesson_id, 'mcq',
    'Solve 3p = 18.',
    'Divide both sides by 3.',
    'p = 6.',
    true
  from l
  where not exists (
    select 1 from public.questions where prompt = 'Solve 3p = 18.' and lesson_id = l.lesson_id
  )
  returning id
)
insert into public.question_options (id, question_id, label, is_correct)
select gen_random_uuid(), q.id, '6', true from q
union all select gen_random_uuid(), q.id, '9', false from q
union all select gen_random_uuid(), q.id, '12', false from q
union all select gen_random_uuid(), q.id, '15', false from q;

with l as (
  select id as lesson_id, topic_id from public.lessons where title = 'Solving one-step equations' limit 1
)
insert into public.questions (id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published)
select gen_random_uuid(), l.topic_id, l.lesson_id, 'short',
  'Solve n - 4 = 9.',
  'Add 4 to both sides.',
  'n = 13.',
  true
from l
where not exists (
  select 1 from public.questions where prompt = 'Solve n - 4 = 9.' and lesson_id = l.lesson_id
);

commit;
