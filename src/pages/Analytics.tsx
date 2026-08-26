import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { formatNumber, cn } from '../lib/utils';

const performanceData = [
  { name: 'Mon', views: 4000, engagement: 2400 },
  { name: 'Tue', views: 3000, engagement: 1398 },
  { name: 'Wed', views: 2000, engagement: 9800 },
  { name: 'Thu', views: 2780, engagement: 3908 },
  { name: 'Fri', views: 1890, engagement: 4800 },
  { name: 'Sat', views: 2390, engagement: 3800 },
  { name: 'Sun', views: 3490, engagement: 4300 },
];

const pillarData = [
  { name: 'Education', performance: 8.9 },
  { name: 'Founder Stories', performance: 8.1 },
  { name: 'Entertainment', performance: 7.8 },
  { name: 'Product', performance: 6.5 },
  { name: 'Community', performance: 5.9 },
];

export default function Analytics() {
  const { content } = useStore();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1">Measure content performance and insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reach', value: '3.4M', trend: '+12.5%', isPositive: true },
          { label: 'Engagement Rate', value: '6.2%', trend: '+1.2%', isPositive: true },
          { label: 'Followers Gained', value: '12.4K', trend: '-2.4%', isPositive: false },
          { label: 'Content Score', value: '84', trend: '+5', isPositive: true },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="text-3xl font-bold">{stat.value}</h2>
                <span className={cn(
                  "flex items-center text-sm font-medium",
                  stat.isPositive ? "text-emerald-600" : "text-red-600"
                )}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Schedule Consistency</span>
              <span className="font-semibold text-emerald-600">92%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-slate-500">Production Velocity</span>
              <span className="font-semibold text-emerald-600">81%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '81%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-slate-500">Approval Efficiency</span>
              <span className="font-semibold text-amber-500">74%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '74%' }}></div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex gap-3">
              <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Review Bottleneck</p>
                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">Average review duration is 28 hours. Consider adding another reviewer.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Pillar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pillarData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} fontSize={12} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="performance" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.filter(c => c.views).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4).map((item, i) => (
                <div key={item.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                  <div className="flex gap-3">
                    <span className="font-bold text-slate-300 dark:text-slate-600 w-4">{i + 1}</span>
                    <div>
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.platform}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(item.views)}</p>
                    <p className="text-xs text-slate-500">Views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
