import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const { structured_summary, revised_hpi } = await request.json()

  const { data, error } = await supabase
    .from('cases')
    .update({
      structured_summary,
      revised_hpi,
      is_edited: true
    })
    .eq('id', id)
    .select()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data[0])
}
