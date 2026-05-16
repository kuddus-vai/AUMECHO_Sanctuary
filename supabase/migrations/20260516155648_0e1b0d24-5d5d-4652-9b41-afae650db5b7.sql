
-- booking_inquiries
CREATE TABLE public.booking_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  event_date date,
  event_type text,
  venue text,
  city text,
  expected_attendance text,
  budget_range text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'
);

ALTER TABLE public.booking_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit booking inquiries"
  ON public.booking_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view inquiries"
  ON public.booking_inquiries FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update inquiries"
  ON public.booking_inquiries FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete inquiries"
  ON public.booking_inquiries FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER booking_inquiries_updated_at
  BEFORE UPDATE ON public.booking_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- tour_dates
CREATE TABLE public.tour_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  event_date date NOT NULL,
  venue text NOT NULL,
  city text NOT NULL,
  country text,
  ticket_url text,
  status text NOT NULL DEFAULT 'on_sale',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.tour_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published tour dates"
  ON public.tour_dates FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can view all tour dates"
  ON public.tour_dates FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tour dates"
  ON public.tour_dates FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tour dates"
  ON public.tour_dates FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tour dates"
  ON public.tour_dates FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER tour_dates_updated_at
  BEFORE UPDATE ON public.tour_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- seed placeholder shows
INSERT INTO public.tour_dates (event_date, venue, city, country, ticket_url, status, sort_order) VALUES
  ((now() + interval '21 days')::date, 'Echo Hall', 'Berlin', 'Germany', 'https://example.com/tickets/berlin', 'on_sale', 1),
  ((now() + interval '38 days')::date, 'Static Room', 'Amsterdam', 'Netherlands', 'https://example.com/tickets/ams', 'on_sale', 2),
  ((now() + interval '52 days')::date, 'Lumen Club', 'Paris', 'France', 'https://example.com/tickets/paris', 'few_left', 3),
  ((now() + interval '70 days')::date, 'Nightform', 'London', 'UK', NULL, 'announced', 4),
  ((now() + interval '95 days')::date, 'Aurora Festival', 'Reykjavik', 'Iceland', 'https://example.com/tickets/reyk', 'on_sale', 5);
