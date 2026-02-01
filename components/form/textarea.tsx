export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-2 border bg-tea-green/20 border-tea-green
        focus:outline-none focus:ring-2 focus:ring-tea-green/80 
        resize-y ${props.className}`}
    />
  )
}