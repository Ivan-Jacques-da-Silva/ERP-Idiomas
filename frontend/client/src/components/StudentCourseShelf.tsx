import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  courseId: string;
  title: string;
  currentBookId?: string | null;
  disabled?: boolean;
}

export default function StudentCourseShelf({ courseId, title, currentBookId, disabled }: Props) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["student-course-details", courseId],
    queryFn: async () => apiRequest(`/api/student/courses/${courseId}`),
  });

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {disabled && (
          <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Bloqueado</Badge>
        )}
      </div>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {isLoading && (
            <div className="text-muted-foreground">Carregando…</div>
          )}
          {!isLoading && data?.course?.books?.map((book: any) => {
            const isCurrent = currentBookId && book.id === currentBookId;
            const isDisabled = disabled || (!isCurrent);
            return (
              <div key={book.id} className={`min-w-[220px] snap-start select-none ${isDisabled ? 'opacity-60 grayscale' : ''}`}>
                <div className={`rounded-xl shadow-md overflow-hidden border ${isCurrent ? 'border-blue-500' : 'border-transparent'}`} style={{ background: book.color || '#1f2937' }}>
                  <div className="h-28 bg-gradient-to-br from-black/20 to-black/0" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{book.name}</div>
                    <div className="text-xs text-muted-foreground">{book.description || ' '}</div>
                  </div>
                  <Button size="sm" disabled={isDisabled} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    {isCurrent ? 'Continuar' : 'Bloqueado'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

