import React, { useState, useEffect } from 'react'
import Button from './ui/Button'
import { supabase } from '@/lib/supabase'
import GradientBorderContainer from './ui/GradientBorderContainer'

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
    <GradientBorderContainer className="mb-8 p-0">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="day-comment" className="block text-sm font-semibold text-purple-700 mb-1">
          Comment
        </label>
        <textarea
          id="day-comment"
          className="w-full rounded-lg border border-purple-200 bg-purple-50 shadow-sm p-3 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm min-h-[60px] transition-colors"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="How was your workout?"
          rows={2}
          disabled={submitting || loading}
        />
        {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" disabled={submitting || loading}>
            {submitting ? 'Saving...' : loading ? 'Loading...' : 'Save Comment'}
          </Button>
        </div>
      </form>
    </GradientBorderContainer>
  )
}