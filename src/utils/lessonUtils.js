export function getLessonsCount(course) {
  if (typeof course.lessons_count === 'number') {
    return course.lessons_count;
  }
  if (Array.isArray(course.modules)) {
    return course.modules.reduce((sum, mod) => {
      if (Array.isArray(mod.lessons)) {
        return sum + mod.lessons.length;
      }
      return sum;
    }, 0);
  }
  return 0;
} 