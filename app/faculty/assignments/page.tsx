import { redirect } from 'next/navigation';

export default function FacultyAssignmentsRedirectPage() {
  redirect('/faculty/assignments/create');
}
