import React, { useState, useEffect } from 'react'
import Button from './ui/Button'
import { supabase } from '@/lib/supabase'
import GradientBorderContainer from './ui/GradientBorderContainer'
import Textarea from './form/textarea'

interface CommentInputProps {
  date: string
}

export default function CommentInput({ date }: CommentInputProps) {
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    supabase
      .from('comments')
      .select('comment')
      .eq('date', date)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then(({ data, error }) => {
        if (isMounted) {
          if (data && data.comment) {
            setComment(data.comment)
            setCommentError('')
          } else {
            setComment('')
            setCommentError('')
          }
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Check if a comment already exists for this date
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .select('comment')
      .eq('date', date);
    if (commentData && commentData.length > 0) {
      if (!comment.trim()) {
        // Delete the comment if the input was empty
        await supabase
          .from('comments')
          .delete()
          .eq('date', date);
      } else {
        // If a comment already exists, update it
        await supabase
          .from('comments')
          .update({ comment })
          .eq('date', date);
      }
    } else if (comment.trim()) {
      // If no comment exists, create a new one
      await supabase
        .from('comments')
        .insert({ date, comment });
    }
    if (commentError) {
      setCommentError(commentError.message)
    } else {
      setCommentError('')
    }
    setSubmitting(false)
  }

  return (
    <GradientBorderContainer>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="day-comment" className="block text-sm font-semibold">
          Comment
        </label>
        <Textarea
          id="day-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="How was your workout?"
          rows={2}
          disabled={submitting || loading}
        />
        {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting || loading}>
            {submitting ? 'Saving...' : loading ? 'Loading...' : 'Save Comment'}
          </Button>
        </div>
      </form>
    </GradientBorderContainer>
  )
}