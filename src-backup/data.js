export const posts = [
  {
    id: 1,
    title: "Campus Life at University",
    content: "University life is full of exciting experiences and opportunities. From joining clubs to making lifelong friends, every day brings something new. The campus is buzzing with energy, and there's always something happening. Whether it's cultural festivals, sports events, or academic seminars, you'll never have a dull moment. The best part is the diverse community of students from all over the world, each bringing their unique perspectives and cultures.",
    author: "John Smith",
    authorEmail: "john@college.edu",
    date: "2024-02-15",
    likes: 45,
    category: "Campus Life",
    comments: [
      { id: 1, user: "Alice", text: "Great article! Really captures the essence of campus life.", date: "2024-02-16" },
      { id: 2, user: "Bob", text: "I miss my college days after reading this!", date: "2024-02-17" }
    ],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&auto=format"
  },
  {
    id: 2,
    title: "Study Tips for Exam Success",
    content: "Preparing for exams can be stressful, but with the right strategies, you can ace them. Start early, create a study schedule, take regular breaks, and practice active recall. Form study groups to discuss concepts and test each other. Remember to get enough sleep and stay hydrated during exam week. Using the Pomodoro technique (25 minutes study, 5 minutes break) can significantly improve your focus and retention.",
    author: "Emily Johnson",
    authorEmail: "emily@college.edu",
    date: "2024-02-10",
    likes: 78,
    category: "Academics",
    comments: [
      { id: 1, user: "Charlie", text: "These tips really helped me improve my grades!", date: "2024-02-11" },
      { id: 2, user: "Diana", text: "The study group suggestion is gold!", date: "2024-02-12" }
    ],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format"
  },
  {
    id: 3,
    title: "Best Cafeterias on Campus",
    content: "Tired of the same food every day? Check out these hidden gems around campus. The Science Building Cafe has amazing coffee and freshly baked pastries. The Student Union offers diverse international cuisines from around the world. The Library Bistro is perfect for quick bites between classes with their healthy options. Don't forget to try the famous Wednesday special at the Main Cafeteria - their homemade pizza is legendary!",
    author: "Michael Chen",
    authorEmail: "michael@college.edu",
    date: "2024-02-05",
    likes: 62,
    category: "Food",
    comments: [
      { id: 1, user: "Eve", text: "The coffee at Science Building is indeed the best!", date: "2024-02-06" }
    ],
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format"
  },
  {
    id: 4,
    title: "Internship Opportunities for Students",
    content: "Summer internships are crucial for building your career. Many tech companies offer remote internships now. Check your college career center, attend job fairs, and network with alumni. Update your LinkedIn profile and start applying early. Some companies even offer stipends and housing assistance. Top companies like Google, Microsoft, and Amazon have specific programs for college students with great mentorship opportunities.",
    author: "Sarah Williams",
    authorEmail: "sarah@college.edu",
    date: "2024-02-01",
    likes: 92,
    category: "Career",
    comments: [
      { id: 1, user: "Frank", text: "Thanks for the tips! Just landed my first internship.", date: "2024-02-02" },
      { id: 2, user: "Grace", text: "The career center is really helpful!", date: "2024-02-03" }
    ],
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&auto=format"
  }
];

export const categories = ["All", "Campus Life", "Academics", "Food", "Career"];