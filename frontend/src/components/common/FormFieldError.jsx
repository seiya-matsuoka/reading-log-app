export default function FormFieldError({ message }) {
  if (!message) return null;
  return <p className="text-danger mt-1 text-xs">{message}</p>;
}
