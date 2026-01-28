'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  FileText,
  Video,
  BookOpen,
  Download,
  ExternalLink,
  Play,
  Clock,
  Search,
} from 'lucide-react';

const documents = [
  {
    name: 'Elevated Hypertrophy Program',
    type: 'PDF',
    size: '2.4 MB',
    category: 'Program',
  },
  {
    name: 'Nutrition Guidelines',
    type: 'PDF',
    size: '1.8 MB',
    category: 'Nutrition',
  },
  {
    name: 'Macro Tracking Guide',
    type: 'PDF',
    size: '856 KB',
    category: 'Nutrition',
  },
  {
    name: 'Supplement Recommendations',
    type: 'PDF',
    size: '512 KB',
    category: 'Nutrition',
  },
  {
    name: 'Recovery & Sleep Guide',
    type: 'PDF',
    size: '1.2 MB',
    category: 'Lifestyle',
  },
];

const videos = [
  {
    title: 'Proper Bench Press Form',
    duration: '8:24',
    category: 'Chest',
    thumbnail: 'bench',
  },
  {
    title: 'Squat Technique Masterclass',
    duration: '12:15',
    category: 'Legs',
    thumbnail: 'squat',
  },
  {
    title: 'Deadlift Setup & Execution',
    duration: '10:42',
    category: 'Back',
    thumbnail: 'deadlift',
  },
  {
    title: 'Shoulder Press Variations',
    duration: '6:33',
    category: 'Shoulders',
    thumbnail: 'ohp',
  },
  {
    title: 'Lat Pulldown Technique',
    duration: '5:18',
    category: 'Back',
    thumbnail: 'lat',
  },
  {
    title: 'Bicep Curl Variations',
    duration: '7:45',
    category: 'Arms',
    thumbnail: 'bicep',
  },
];

const articles = [
  {
    title: 'Understanding Progressive Overload',
    readTime: '5 min read',
    category: 'Training',
  },
  {
    title: 'How to Break Through Plateaus',
    readTime: '7 min read',
    category: 'Training',
  },
  {
    title: 'Protein Timing: Does It Matter?',
    readTime: '6 min read',
    category: 'Nutrition',
  },
  {
    title: 'Sleep & Recovery for Muscle Growth',
    readTime: '8 min read',
    category: 'Recovery',
  },
  {
    title: 'Managing Training Around a Busy Schedule',
    readTime: '5 min read',
    category: 'Lifestyle',
  },
];

const categories = ['All', 'Program', 'Nutrition', 'Training', 'Recovery', 'Lifestyle'];

export default function ResourcesPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Resources</h1>
        <p className="mt-2 text-grey-600">
          Access your program materials, educational content, and coaching resources.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-12 pr-4 py-3 border border-grey-300 focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                category === 'All'
                  ? 'bg-black text-white'
                  : 'bg-grey-100 text-grey-700 hover:bg-grey-200 hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Documents
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-grey-200">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-grey-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-black">{doc.name}</p>
                      <p className="text-sm text-grey-500">
                        {doc.type} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs bg-grey-100 text-grey-600 px-2 py-1">
                      {doc.category}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Video Library Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            Exercise Video Library
          </h2>
          <Button variant="outline" size="sm">
            View All
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <Card key={index} hover>
              <div className="aspect-video bg-grey-200 relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <span className="text-xs text-blue-600 font-medium">{video.category}</span>
                <h3 className="font-semibold text-black mt-1">{video.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Educational Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <Card key={index} hover className="cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                    <h3 className="font-semibold text-black mt-1 text-lg">{article.title}</h3>
                    <div className="flex items-center gap-2 mt-3 text-grey-500 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-grey-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-bold text-black mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'MyFitnessPal Setup', desc: 'Connect your nutrition tracking' },
            { name: 'Recommended Apps', desc: 'Tools to enhance your journey' },
            { name: 'FAQ', desc: 'Common questions answered' },
            { name: 'Contact Coach', desc: 'Get direct support' },
          ].map((link, index) => (
            <Card key={index} hover className="cursor-pointer">
              <CardContent className="p-4">
                <h3 className="font-semibold text-black">{link.name}</h3>
                <p className="text-sm text-grey-500 mt-1">{link.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
