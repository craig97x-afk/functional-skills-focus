-- Exam mocks + question banks (resources by level)
-- Run once in Supabase SQL editor.

create table if not exists public.exam_mocks (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  exam_board text,
  title text not null,
  description text,
  cover_url text,
  file_path text,
  file_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Backfill if the column was added later
alter table public.exam_mocks
  add column if not exists is_featured boolean not null default false;

alter table public.exam_mocks
  add column if not exists exam_board text;

alter table public.exam_mocks
  add column if not exists sort_order integer;

alter table public.exam_mocks
  add column if not exists publish_at timestamp with time zone;

alter table public.exam_mocks
  add column if not exists unpublish_at timestamp with time zone;

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  exam_board text,
  title text not null,
  description text,
  cover_url text,
  content text,
  resource_url text,
  is_published boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.exam_resource_links (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  level_slug text not null,
  exam_board text,
  title text not null,
  description text,
  link_url text not null,
  link_type text,
  is_published boolean not null default false,
  sort_order integer,
  publish_at timestamp with time zone,
  unpublish_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists exam_mocks_subject_level_idx
  on public.exam_mocks (subject, level_slug);

create index if not exists question_sets_subject_level_idx
  on public.question_sets (subject, level_slug);

create index if not exists exam_resource_links_subject_level_idx
  on public.exam_resource_links (subject, level_slug);

create index if not exists exam_mocks_subject_level_board_idx
  on public.exam_mocks (subject, level_slug, exam_board);

create index if not exists question_sets_subject_level_board_idx
  on public.question_sets (subject, level_slug, exam_board);

create index if not exists exam_resource_links_subject_level_board_idx
  on public.exam_resource_links (subject, level_slug, exam_board);

alter table public.exam_mocks enable row level security;
alter table public.question_sets enable row level security;
alter table public.exam_resource_links enable row level security;

-- Optional content column for interactive sets
alter table public.question_sets
  add column if not exists content text;

alter table public.question_sets
  add column if not exists exam_board text;

alter table public.question_sets
  add column if not exists sort_order integer;

alter table public.question_sets
  add column if not exists publish_at timestamp with time zone;

alter table public.question_sets
  add column if not exists unpublish_at timestamp with time zone;

-- Public can read published mocks and question sets
drop policy if exists "Public read exam mocks" on public.exam_mocks;
create policy "Public read exam mocks"
  on public.exam_mocks
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

drop policy if exists "Public read question sets" on public.question_sets;
create policy "Public read question sets"
  on public.question_sets
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

drop policy if exists "Public read exam resource links" on public.exam_resource_links;
create policy "Public read exam resource links"
  on public.exam_resource_links
  for select
  to public
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now())
  );

-- Admins manage mocks and question sets
drop policy if exists "Admins manage exam mocks" on public.exam_mocks;
create policy "Admins manage exam mocks"
  on public.exam_mocks
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins manage question sets" on public.question_sets;
create policy "Admins manage question sets"
  on public.question_sets
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins manage exam resource links" on public.exam_resource_links;
create policy "Admins manage exam resource links"
  on public.exam_resource_links
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- Seed: external Functional Skills and Essential Skills links
-- Safe to re-run; existing links are skipped by URL match.
insert into public.exam_resource_links (
  subject,
  level_slug,
  exam_board,
  title,
  description,
  link_url,
  link_type,
  is_published,
  sort_order
)
select
  v.subject,
  v.level_slug,
  v.exam_board,
  v.title,
  v.description,
  v.link_url,
  v.link_type,
  v.is_published,
  v.sort_order
from (
  values
    ('english', 'entry-1', 'open-awards', 'Open Awards Functional Skills English', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127134', 'qualification-page', true, 10),
    ('english', 'entry-2', 'open-awards', 'Open Awards Functional Skills English', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127135', 'qualification-page', true, 10),
    ('english', 'entry-3', 'open-awards', 'Open Awards Functional Skills English', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127136', 'qualification-page', true, 10),
    ('english', 'fs-1', 'open-awards', 'Open Awards Functional Skills English', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127130', 'qualification-page', true, 10),
    ('english', 'fs-2', 'open-awards', 'Open Awards Functional Skills English', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127131', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'open-awards', 'Open Awards Functional Skills Mathematics', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127137', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'open-awards', 'Open Awards Functional Skills Mathematics', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127138', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'open-awards', 'Open Awards Functional Skills Mathematics', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127139', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'open-awards', 'Open Awards Functional Skills Mathematics', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127132', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'open-awards', 'Open Awards Functional Skills Mathematics', 'Qualification page with sample assessments.', 'https://openawards.org.uk/what-we-offer/qualification-search/qualification-detail/?id=127133', 'qualification-page', true, 10),
    ('english', 'entry-1', 'ncfe', 'NCFE Functional Skills English', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-entry-level-1-functional-skills-qualification-in-english-994', 'qualification-page', true, 10),
    ('english', 'entry-2', 'ncfe', 'NCFE Functional Skills English', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-entry-level-2-functional-skills-qualification-in-english-330', 'qualification-page', true, 10),
    ('english', 'entry-3', 'ncfe', 'NCFE Functional Skills English', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-entry-level-3-functional-skills-qualification-in-english-817', 'qualification-page', true, 10),
    ('english', 'fs-1', 'ncfe', 'NCFE Functional Skills English', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-level-1-functional-skills-qualification-in-english-588', 'qualification-page', true, 10),
    ('english', 'fs-2', 'ncfe', 'NCFE Functional Skills English', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-level-2-functional-skills-qualification-in-english-187', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'ncfe', 'NCFE Functional Skills Mathematics', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-entry-level-1-functional-skills-qualification-in-mathematics-952', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'ncfe', 'NCFE Functional Skills Mathematics', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-entry-level-2-functional-skills-qualification-in-mathematics-356', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'ncfe', 'NCFE Functional Skills Mathematics', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-entry-level-3-functional-skills-qualification-in-mathematics-728', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'ncfe', 'NCFE Functional Skills Mathematics', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-level-1-functional-skills-qualification-in-mathematics-1665', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'ncfe', 'NCFE Functional Skills Mathematics', 'Qualification page with support and assessment materials.', 'https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-level-2-functional-skills-qualification-in-mathematics-1609', 'qualification-page', true, 10),
    ('english', 'fs-1', 'pearson-edexcel', 'Pearson Edexcel Functional Skills English', 'Qualification page for Level 1 and Level 2 resources.', 'https://qualifications.pearson.com/en/qualifications/edexcel-functional-skills/english-2019.html', 'qualification-page', true, 10),
    ('english', 'fs-1', 'pearson-edexcel', 'Pearson Edexcel Functional Skills English specification', 'Specification PDF for Level 1 and Level 2.', 'https://qualifications.pearson.com/content/dam/pdf/Functional%20Skills/English/2019/Specification-and-sample-assessments/Functional%20Skills%20English%20Level%201-2%20specification.pdf', 'specification', true, 20),
    ('maths', 'fs-1', 'pearson-edexcel', 'Pearson Edexcel Functional Skills Mathematics', 'Qualification page for Level 1 and Level 2 resources.', 'https://qualifications.pearson.com/en/qualifications/edexcel-functional-skills/mathematics-2019.html', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'pearson-edexcel', 'Pearson Edexcel Functional Skills Mathematics specification', 'Specification PDF for Level 1 and Level 2.', 'https://qualifications.pearson.com/content/dam/pdf/Functional%20Skills/Mathematics/2019/Specification-and-sample-assessments/Functional%20Skills%20Mathematics%20Level%201-2%20specification.pdf', 'specification', true, 20),
    ('english', 'fs-2', 'pearson-edexcel', 'Pearson Edexcel Functional Skills English', 'Qualification page for Level 1 and Level 2 resources.', 'https://qualifications.pearson.com/en/qualifications/edexcel-functional-skills/english-2019.html', 'qualification-page', true, 10),
    ('english', 'fs-2', 'pearson-edexcel', 'Pearson Edexcel Functional Skills English specification', 'Specification PDF for Level 1 and Level 2.', 'https://qualifications.pearson.com/content/dam/pdf/Functional%20Skills/English/2019/Specification-and-sample-assessments/Functional%20Skills%20English%20Level%201-2%20specification.pdf', 'specification', true, 20),
    ('maths', 'fs-2', 'pearson-edexcel', 'Pearson Edexcel Functional Skills Mathematics', 'Qualification page for Level 1 and Level 2 resources.', 'https://qualifications.pearson.com/en/qualifications/edexcel-functional-skills/mathematics-2019.html', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'pearson-edexcel', 'Pearson Edexcel Functional Skills Mathematics specification', 'Specification PDF for Level 1 and Level 2.', 'https://qualifications.pearson.com/content/dam/pdf/Functional%20Skills/Mathematics/2019/Specification-and-sample-assessments/Functional%20Skills%20Mathematics%20Level%201-2%20specification.pdf', 'specification', true, 20),
    ('english', 'entry-1', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('english', 'entry-2', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('english', 'entry-3', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('english', 'fs-1', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('english', 'fs-2', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'city-and-guilds', 'City and Guilds Functional Skills 4748', 'Main qualification page with documents and assessment information.', 'https://www.cityandguilds.com/en/qualifications-and-apprenticeships/skills-for-work-and-life/english-mathematics-and-ict-skills/4748-functional-skills', 'qualification-page', true, 10),
    ('english', 'fs-1', 'city-and-guilds', 'City and Guilds Open Assess', 'Sample on screen assessments via Open Assess.', 'https://www.cityandguilds.com/en/what-we-offer/centres/skills-for-work-and-life/open-assess', 'sample-assessments', true, 20),
    ('english', 'fs-2', 'city-and-guilds', 'City and Guilds Open Assess', 'Sample on screen assessments via Open Assess.', 'https://www.cityandguilds.com/en/what-we-offer/centres/skills-for-work-and-life/open-assess', 'sample-assessments', true, 20),
    ('maths', 'fs-1', 'city-and-guilds', 'City and Guilds Open Assess', 'Sample on screen assessments via Open Assess.', 'https://www.cityandguilds.com/en/what-we-offer/centres/skills-for-work-and-life/open-assess', 'sample-assessments', true, 20),
    ('maths', 'fs-2', 'city-and-guilds', 'City and Guilds Open Assess', 'Sample on screen assessments via Open Assess.', 'https://www.cityandguilds.com/en/what-we-offer/centres/skills-for-work-and-life/open-assess', 'sample-assessments', true, 20),
    ('english', 'entry-1', 'highfield', 'Highfield Functional Skills English', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills-offer', 'qualification-page', true, 10),
    ('english', 'entry-2', 'highfield', 'Highfield Functional Skills English', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/entry-level-2-english-sac', 'qualification-page', true, 10),
    ('english', 'entry-3', 'highfield', 'Highfield Functional Skills English', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/entry-level-3-english', 'qualification-page', true, 10),
    ('english', 'fs-1', 'highfield', 'Highfield Functional Skills English', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/level-1-english', 'qualification-page', true, 10),
    ('english', 'fs-2', 'highfield', 'Highfield Functional Skills English', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/level-2-english', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'highfield', 'Highfield Functional Skills Mathematics', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills-offer', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'highfield', 'Highfield Functional Skills Mathematics', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills-offer', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'highfield', 'Highfield Functional Skills Mathematics', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/entry-level-3-mathematics', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'highfield', 'Highfield Functional Skills Mathematics', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/level-1-mathematics', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'highfield', 'Highfield Functional Skills Mathematics', 'Qualification page and support materials.', 'https://www.highfieldqualifications.com/products/qualifications/functional-skills/level-2-mathematics', 'qualification-page', true, 10),
    ('english', 'entry-1', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('english', 'entry-2', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('english', 'entry-3', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('english', 'fs-1', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('english', 'fs-2', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'nocn', 'NOCN Functional Skills', 'Main qualification page for Entry Level 1 to Level 2.', 'https://www.nocn.org.uk/products/qualifications/functional-skills/', 'qualification-page', true, 10),
    ('english', 'entry-1', 'vtct-skills', 'VTCT Skills Functional Skills English', 'Functional Skills English page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-english', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'vtct-skills', 'VTCT Skills Functional Skills Mathematics', 'Functional Skills Mathematics page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-mathematics', 'qualification-page', true, 10),
    ('english', 'entry-2', 'vtct-skills', 'VTCT Skills Functional Skills English', 'Functional Skills English page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-english', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'vtct-skills', 'VTCT Skills Functional Skills Mathematics', 'Functional Skills Mathematics page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-mathematics', 'qualification-page', true, 10),
    ('english', 'entry-3', 'vtct-skills', 'VTCT Skills Functional Skills English', 'Functional Skills English page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-english', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'vtct-skills', 'VTCT Skills Functional Skills Mathematics', 'Functional Skills Mathematics page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-mathematics', 'qualification-page', true, 10),
    ('english', 'fs-1', 'vtct-skills', 'VTCT Skills Functional Skills English Level 1', 'Level 1 Functional Skills English qualification page.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/qualification/level-1-functional-skills-qualification-in-english-603-5058-1?product=3556', 'qualification-page', true, 10),
    ('english', 'fs-2', 'vtct-skills', 'VTCT Skills Functional Skills English Level 2', 'Level 2 Functional Skills English qualification page.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/qualification/level-2-functional-skills-qualification-in-english-603-5054-4?product=3557', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'vtct-skills', 'VTCT Skills Functional Skills Mathematics', 'Functional Skills Mathematics page with support information.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/functional-skills/functional-skills-mathematics', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'vtct-skills', 'VTCT Skills Functional Skills Mathematics Level 2', 'Level 2 Functional Skills Mathematics qualification page.', 'https://www.skillsandeducationgroupawards.co.uk/qualifications-and-units/qualification/level-2-functional-skills-qualification-in-mathematics-603-5060-x?product=3559', 'qualification-page', true, 10),
    ('english', 'entry-1', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Entry Level and Level 1 to 2 specifications.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('english', 'entry-2', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Entry Level and Level 1 to 2 specifications.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('english', 'entry-3', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Entry Level and Level 1 to 2 specifications.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Entry Level and Level 1 to 2 specifications.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Entry Level and Level 1 to 2 specifications.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Entry Level and Level 1 to 2 specifications.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('english', 'fs-1', 'tquk', 'TQUK Functional Skills English Level 1', 'Level 1 Functional Skills English page.', 'https://www.tquk.org/functional-skills-resources-english-level-1', 'qualification-page', true, 10),
    ('english', 'fs-2', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Level 2 Functional Skills English details.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'tquk', 'TQUK Functional Skills suite', 'Suite page with Level 1 Functional Skills Mathematics details.', 'https://www.tquk.org/functional-skills-suite', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'tquk', 'TQUK Functional Skills Mathematics Level 2', 'Level 2 Functional Skills Mathematics page.', 'https://www.tquk.org/functional-skills-resources-maths-level-2', 'qualification-page', true, 10),
    ('english', 'fs-1', 'futurequals', 'FutureQuals Functional Skills English Level 1', 'Level 1 Functional Skills English qualification page.', 'https://www.futurequals.com/qualifications/level-1-functional-skills-in-english-reform/', 'qualification-page', true, 10),
    ('english', 'fs-2', 'futurequals', 'FutureQuals Functional Skills English Level 2', 'Level 2 Functional Skills English qualification page.', 'https://www.futurequals.com/qualifications/level2functionalskillsenglish/', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'futurequals', 'FutureQuals Functional Skills Mathematics Level 1', 'Level 1 Functional Skills Mathematics qualification page.', 'https://www.futurequals.com/qualifications/level1functionalskillsmathemaths/', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'futurequals', 'FutureQuals Functional Skills Mathematics Level 2', 'Level 2 Functional Skills Mathematics qualification page.', 'https://www.futurequals.com/qualifications/level2functionalskillsmaths/', 'qualification-page', true, 10),
    ('english', 'fs-1', 'futurequals', 'FutureQuals sample assessments', 'Public sample assessment links for Functional Skills.', 'https://www.futurequals.com/sample-assessments/', 'sample-assessments', true, 20),
    ('english', 'fs-1', 'futurequals', 'FutureQuals Functional Skills overview', 'Overview page for FutureQuals Functional Skills.', 'https://www.futurequals.com/futurequals-functional-skills/', 'overview', true, 30),
    ('english', 'fs-2', 'futurequals', 'FutureQuals sample assessments', 'Public sample assessment links for Functional Skills.', 'https://www.futurequals.com/sample-assessments/', 'sample-assessments', true, 20),
    ('english', 'fs-2', 'futurequals', 'FutureQuals Functional Skills overview', 'Overview page for FutureQuals Functional Skills.', 'https://www.futurequals.com/futurequals-functional-skills/', 'overview', true, 30),
    ('maths', 'fs-1', 'futurequals', 'FutureQuals sample assessments', 'Public sample assessment links for Functional Skills.', 'https://www.futurequals.com/sample-assessments/', 'sample-assessments', true, 20),
    ('maths', 'fs-1', 'futurequals', 'FutureQuals Functional Skills overview', 'Overview page for FutureQuals Functional Skills.', 'https://www.futurequals.com/futurequals-functional-skills/', 'overview', true, 30),
    ('maths', 'fs-2', 'futurequals', 'FutureQuals sample assessments', 'Public sample assessment links for Functional Skills.', 'https://www.futurequals.com/sample-assessments/', 'sample-assessments', true, 20),
    ('maths', 'fs-2', 'futurequals', 'FutureQuals Functional Skills overview', 'Overview page for FutureQuals Functional Skills.', 'https://www.futurequals.com/futurequals-functional-skills/', 'overview', true, 30),
    ('english', 'entry-1', 'wjec-essential-skills-wales', 'WJEC Essential Communication Skills', 'Essential Skills Wales communication qualification page.', 'https://www.wjec.co.uk/qualifications/essential-communication-skills-ecomms/', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'wjec-essential-skills-wales', 'WJEC Essential Application of Number Skills', 'Essential Skills Wales numeracy qualification page.', 'https://www.wjec.co.uk/qualifications/essential-application-of-number-skills-eaons/', 'qualification-page', true, 10),
    ('english', 'entry-2', 'wjec-essential-skills-wales', 'WJEC Essential Communication Skills', 'Essential Skills Wales communication qualification page.', 'https://www.wjec.co.uk/qualifications/essential-communication-skills-ecomms/', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'wjec-essential-skills-wales', 'WJEC Essential Application of Number Skills', 'Essential Skills Wales numeracy qualification page.', 'https://www.wjec.co.uk/qualifications/essential-application-of-number-skills-eaons/', 'qualification-page', true, 10),
    ('english', 'entry-3', 'wjec-essential-skills-wales', 'WJEC Essential Communication Skills', 'Essential Skills Wales communication qualification page.', 'https://www.wjec.co.uk/qualifications/essential-communication-skills-ecomms/', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'wjec-essential-skills-wales', 'WJEC Essential Application of Number Skills', 'Essential Skills Wales numeracy qualification page.', 'https://www.wjec.co.uk/qualifications/essential-application-of-number-skills-eaons/', 'qualification-page', true, 10),
    ('english', 'fs-1', 'wjec-essential-skills-wales', 'WJEC Essential Communication Skills', 'Essential Skills Wales communication qualification page.', 'https://www.wjec.co.uk/qualifications/essential-communication-skills-ecomms/', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'wjec-essential-skills-wales', 'WJEC Essential Application of Number Skills', 'Essential Skills Wales numeracy qualification page.', 'https://www.wjec.co.uk/qualifications/essential-application-of-number-skills-eaons/', 'qualification-page', true, 10),
    ('english', 'fs-2', 'wjec-essential-skills-wales', 'WJEC Essential Communication Skills', 'Essential Skills Wales communication qualification page.', 'https://www.wjec.co.uk/qualifications/essential-communication-skills-ecomms/', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'wjec-essential-skills-wales', 'WJEC Essential Application of Number Skills', 'Essential Skills Wales numeracy qualification page.', 'https://www.wjec.co.uk/qualifications/essential-application-of-number-skills-eaons/', 'qualification-page', true, 10),
    ('english', 'entry-1', 'agored-cymru', 'Agored Cymru Entry Level ESW Communication', 'Entry Level Essential Skills Wales communication page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Communication-Skills/Entry-level-ESW-Communication', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'agored-cymru', 'Agored Cymru Entry Level ESW Application of Number', 'Entry Level Essential Skills Wales number page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Application-of-Number-Skills/Entry-Level-ESW-Application-of-Number', 'qualification-page', true, 10),
    ('english', 'entry-2', 'agored-cymru', 'Agored Cymru Entry Level ESW Communication', 'Entry Level Essential Skills Wales communication page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Communication-Skills/Entry-level-ESW-Communication', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'agored-cymru', 'Agored Cymru Entry Level ESW Application of Number', 'Entry Level Essential Skills Wales number page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Application-of-Number-Skills/Entry-Level-ESW-Application-of-Number', 'qualification-page', true, 10),
    ('english', 'entry-3', 'agored-cymru', 'Agored Cymru Entry Level ESW Communication', 'Entry Level Essential Skills Wales communication page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Communication-Skills/Entry-level-ESW-Communication', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'agored-cymru', 'Agored Cymru Entry Level ESW Application of Number', 'Entry Level Essential Skills Wales number page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Application-of-Number-Skills/Entry-Level-ESW-Application-of-Number', 'qualification-page', true, 10),
    ('english', 'fs-1', 'agored-cymru', 'Agored Cymru Level 1 to 3 Essential Communication', 'Level 1 to 3 Essential Communication page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Communication-Skills/Level-One-to-level-Three-Essential-Communication', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'agored-cymru', 'Agored Cymru Level 1 to 3 Essential Application of Number', 'Level 1 to 3 Essential Application of Number page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Application-of-Number-Skills/Level-One-to-Level-Three-Essential-Application-of-Number', 'qualification-page', true, 10),
    ('english', 'fs-2', 'agored-cymru', 'Agored Cymru Level 1 to 3 Essential Communication', 'Level 1 to 3 Essential Communication page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Communication-Skills/Level-One-to-level-Three-Essential-Communication', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'agored-cymru', 'Agored Cymru Level 1 to 3 Essential Application of Number', 'Level 1 to 3 Essential Application of Number page.', 'https://www.agored.cymru/Units-and-Qualifications/Essential-Skills-Wales/Essential-Skills-for-Learners/Essential-Application-of-Number-Skills/Level-One-to-Level-Three-Essential-Application-of-Number', 'qualification-page', true, 10),
    ('english', 'entry-1', 'ocn-ni', 'OCN NI Entry Level Essential Skills Literacy', 'Entry Level literacy qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-entry-level-certificate-in-essential-skills-adult-literacy', 'qualification-page', true, 10),
    ('maths', 'entry-1', 'ocn-ni', 'OCN NI Entry Level Essential Skills Numeracy', 'Entry Level numeracy qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-entry-level-certificate-in-essential-skills-adult-numeracy', 'qualification-page', true, 10),
    ('english', 'entry-2', 'ocn-ni', 'OCN NI Entry Level Essential Skills Literacy', 'Entry Level literacy qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-entry-level-certificate-in-essential-skills-adult-literacy', 'qualification-page', true, 10),
    ('maths', 'entry-2', 'ocn-ni', 'OCN NI Entry Level Essential Skills Numeracy', 'Entry Level numeracy qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-entry-level-certificate-in-essential-skills-adult-numeracy', 'qualification-page', true, 10),
    ('english', 'entry-3', 'ocn-ni', 'OCN NI Entry Level Essential Skills Literacy', 'Entry Level literacy qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-entry-level-certificate-in-essential-skills-adult-literacy', 'qualification-page', true, 10),
    ('maths', 'entry-3', 'ocn-ni', 'OCN NI Entry Level Essential Skills Numeracy', 'Entry Level numeracy qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-entry-level-certificate-in-essential-skills-adult-numeracy', 'qualification-page', true, 10),
    ('english', 'fs-1', 'ocn-ni', 'OCN NI Level 1 Essential Skills Communication', 'Level 1 communication qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-level-1-certificate-in-essential-skills-communication', 'qualification-page', true, 10),
    ('english', 'fs-2', 'ocn-ni', 'OCN NI Level 2 Essential Skills Communication', 'Level 2 communication qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-level-2-certificate-in-essential-skills-communication', 'qualification-page', true, 10),
    ('maths', 'fs-1', 'ocn-ni', 'OCN NI Level 1 Essential Skills Application of Number', 'Level 1 application of number qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-level-1-certificate-in-essential-skills-application-of-number', 'qualification-page', true, 10),
    ('maths', 'fs-2', 'ocn-ni', 'OCN NI Level 2 Essential Skills Application of Number', 'Level 2 application of number qualification page.', 'https://www.ocnni.org.uk/qualifications/ocn-ni-level-2-certificate-in-essential-skills-application-of-number', 'qualification-page', true, 10)
) as v(
  subject,
  level_slug,
  exam_board,
  title,
  description,
  link_url,
  link_type,
  is_published,
  sort_order
)
where not exists (
  select 1
  from public.exam_resource_links e
  where e.subject = v.subject
    and e.level_slug = v.level_slug
    and coalesce(e.exam_board, '') = coalesce(v.exam_board, '')
    and e.link_url = v.link_url
);

-- Storage: exam mock files + covers
insert into storage.buckets (id, name, public)
values ('exam-mocks', 'exam-mocks', true)
on conflict (id) do update set public = true;

-- Public read for exam mock files
drop policy if exists "Public read exam mock files" on storage.objects;
create policy "Public read exam mock files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'exam-mocks');

-- Admins manage exam mock files
drop policy if exists "Admins insert exam mock files" on storage.objects;
create policy "Admins insert exam mock files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins update exam mock files" on storage.objects;
create policy "Admins update exam mock files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "Admins delete exam mock files" on storage.objects;
create policy "Admins delete exam mock files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exam-mocks'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
