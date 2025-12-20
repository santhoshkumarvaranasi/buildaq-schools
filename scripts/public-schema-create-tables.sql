CREATE TABLE topic_test_results (
  remarks text,
  topic_test_id integer,
  tenant_id integer,
  student_id integer,
  id integer,
  score integer,
  submitted_at timestamp without time zone
);
CREATE TABLE academic_years (
  is_current boolean,
  name character varying(20),
  start_date date,
  end_date date,
  id integer
);
CREATE TABLE syllabi (
  subject_id integer,
  created_at timestamp without time zone,
  tenant_id integer,
  id integer,
  syllabus_content text,
  academic_year_id integer
);
CREATE TABLE enrollment_status (
  name character varying(20),
  tenant_id integer,
  id integer
);
CREATE TABLE fee_installments (
  notes text,
  amount numeric,
  id integer,
  due_date date,
  status character varying(20),
  paid_date date,
  student_fee_id integer
);
CREATE TABLE sections (
  created_at timestamp without time zone,
  tenant_id integer,
  name character varying(100),
  is_active boolean,
  class_id integer,
  id integer,
  capacity integer,
  academic_year_id integer
);
CREATE TABLE tenants (
  name character varying(255),
  id integer,
  created_at timestamp without time zone,
  domain character varying(255)
);
CREATE TABLE topic_tests (
  test_date date,
  description text,
  id integer,
  tenant_id integer,
  max_score integer,
  topic_schedule_id integer
);
CREATE TABLE enrollments (
  enrolled_at timestamp without time zone,
  status_id integer,
  academic_year_id integer,
  enrollment_date date,
  class_id integer,
  id integer,
  student_id integer,
  tenant_id integer
);
CREATE TABLE student_fees (
  id integer,
  class_id integer,
  fee_id integer,
  status character varying(20),
  student_id integer,
  created_at timestamp without time zone,
  discount numeric,
  total_fee numeric,
  amount_paid numeric,
  tenant_id integer
);
CREATE TABLE attendance (
  status character varying(20),
  academic_year_id integer,
  class_id integer,
  notes text,
  topic_schedule_id integer,
  student_id integer,
  id integer,
  tenant_id integer,
  date date
);
CREATE TABLE classes (
  tenant_id integer,
  is_active boolean,
  teacher_id integer,
  academic_year_id integer,
  start_date date,
  department_id integer,
  end_date date,
  name character varying(255),
  id integer,
  code character varying(50)
);
CREATE TABLE class_fees (
  class_id integer,
  created_at timestamp without time zone,
  academic_year_id integer,
  amount numeric,
  id integer
);
CREATE TABLE topic_feedback (
  rating integer,
  topic_schedule_id integer,
  student_id integer,
  tenant_id integer,
  feedback_text text,
  id integer,
  created_at timestamp without time zone
);
CREATE TABLE fees (
  due_date date,
  tenant_id integer,
  class_id integer,
  created_at timestamp without time zone,
  amount numeric,
  id integer,
  status character varying(20),
  academic_year_id integer
);
CREATE TABLE permissions (
  description text,
  id integer,
  tenant_id integer,
  name character varying(100)
);
CREATE TABLE departments (
  created_at timestamp without time zone,
  tenant_id integer,
  name character varying(255),
  id integer,
  head_id integer
);
CREATE TABLE topic_status (
  tenant_id integer,
  id integer,
  name character varying(20)
);
CREATE TABLE users (
  grade_level character varying(20),
  phone character varying(30),
  first_name character varying(100),
  emergency_contact jsonb,
  email character varying(255),
  avatar character varying(255),
  id integer,
  salary numeric,
  created_at timestamp without time zone,
  last_name character varying(100),
  qualification character varying(200),
  bio text,
  gpa numeric,
  hire_date date,
  date_of_birth date,
  medical_info jsonb,
  address jsonb,
  enrollment_date date,
  academic_info jsonb,
  tenant_id integer,
  experience integer,
  status_id integer,
  password_hash text
);
CREATE TABLE user_status (
  id integer,
  name character varying(20)
);
CREATE TABLE class_subjects (
  subject_id integer,
  teacher_id integer,
  id integer,
  tenant_id integer,
  class_id integer
);
CREATE TABLE roles (
  name character varying(50),
  description text,
  id integer,
  tenant_id integer
);
CREATE TABLE topic_schedule (
  teacher_id integer,
  id integer,
  class_id integer,
  status_id integer,
  notes text,
  actual_date date,
  planned_date date,
  academic_year_id integer,
  syllabus_topic_id integer,
  tenant_id integer
);
CREATE TABLE user_roles (
  role_id integer,
  user_id integer
);
CREATE TABLE role_permissions (
  permission_id integer,
  tenant_id integer,
  role_id integer
);
CREATE TABLE subjects (
  tenant_id integer,
  department_id integer,
  created_at timestamp without time zone,
  name character varying(100),
  code character varying(50),
  id integer
);
CREATE TABLE syllabus_topics (
  tenant_id integer,
  title character varying(255),
  id integer,
  description text,
  syllabi_id integer,
  sequence integer
);