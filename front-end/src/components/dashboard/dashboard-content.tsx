import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, BarChart2, Clock } from 'lucide-react';
import { VisitorChart } from '@/components/dashboard/visitor-chart';

export function DashboardContent() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4,42,236</div>
            <div className="mt-1 flex items-center text-sm">
              <div className="flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-blue-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                59.3%
              </div>
              <div className="ml-2 text-gray-500">
                You made an extra{' '}
                <span className="font-medium text-blue-600">35,000</span> this
                year
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78,250</div>
            <div className="mt-1 flex items-center text-sm">
              <div className="flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-blue-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                70.5%
              </div>
              <div className="ml-2 text-gray-500">
                You made an extra{' '}
                <span className="font-medium text-blue-600">8,900</span> this
                year
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18,800</div>
            <div className="mt-1 flex items-center text-sm">
              <div className="flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-amber-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                27.4%
              </div>
              <div className="ml-2 text-gray-500">
                You made an extra{' '}
                <span className="font-medium text-amber-600">1,943</span> this
                year
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">35,078</div>
            <div className="mt-1 flex items-center text-sm">
              <div className="flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-amber-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                27.4%
              </div>
              <div className="ml-2 text-gray-500">
                You made an extra{' '}
                <span className="font-medium text-amber-600">20,395</span> this
                year
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Unique Visitor</CardTitle>
            <Tabs defaultValue="month" className="mt-2">
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <VisitorChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-500">This Week Statistics</div>
              <div className="text-4xl font-bold">$7,650</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Page views</div>
                    <div className="text-lg font-semibold">105</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Sessions</div>
                    <div className="text-lg font-semibold">36</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <img
                  src="/placeholder.svg?height=120&width=240"
                  alt="Device Statistics"
                  className="h-[120px] w-full rounded-lg object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </>
  );
}
