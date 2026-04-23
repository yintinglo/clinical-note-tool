import { supabase } from '@/lib/supabase'

export async function POST(request) {
  const { clinical_note, structured_summary, revised_hpi } = await request.json()

  console.log('structured_summary:', structured_summary)

  const { data, error } = await supabase
    .from('cases')
    .insert({
      clinical_note,
      structured_summary,
      revised_hpi,
      is_edited: false
    })
    .select()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data[0])
}

export async function GET() {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
