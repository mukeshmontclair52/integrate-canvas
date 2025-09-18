import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PerformanceMetrics } from "@/types/performance";
import { Clock, File, Network, Cookie, Globe, Monitor } from "lucide-react";

interface PerformanceMetricsPanelProps {
  metrics: PerformanceMetrics;
}

export const PerformanceMetricsPanel = ({ metrics }: PerformanceMetricsPanelProps) => {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatTime = (ms: number): string => {
    return `${ms.toFixed(0)}ms`;
  };

  const getPerformanceScore = (loadTime: number): { score: number; color: string; label: string } => {
    if (loadTime < 1000) return { score: 90, color: 'text-green-600', label: 'Excellent' };
    if (loadTime < 2500) return { score: 70, color: 'text-yellow-600', label: 'Good' };
    if (loadTime < 4000) return { score: 50, color: 'text-orange-600', label: 'Fair' };
    return { score: 30, color: 'text-red-600', label: 'Poor' };
  };

  const performanceScore = getPerformanceScore(metrics.loadTime);

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(metrics.loadTime)}</div>
              <div className="text-sm text-muted-foreground">Load Time</div>
              <Badge variant="outline" className={performanceScore.color}>
                {performanceScore.label}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(metrics.firstContentfulPaint)}</div>
              <div className="text-sm text-muted-foreground">First Paint</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.resources.length}</div>
              <div className="text-sm text-muted-foreground">Total Resources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatSize(metrics.totalJSSize + metrics.totalCSSSize + metrics.totalImageSize)}
              </div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="cookies">Cookies</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <File className="h-4 w-4" />
                  JavaScript ({metrics.jsFileCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{formatSize(metrics.totalJSSize)}</div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <File className="h-4 w-4" />
                  CSS ({metrics.cssFileCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{formatSize(metrics.totalCSSSize)}</div>
                <Progress value={45} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Images ({metrics.imageFileCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{formatSize(metrics.totalImageSize)}</div>
                <Progress value={60} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resource Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {metrics.resources.slice(0, 20).map((resource, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" title={resource.name}>
                          {resource.name.split('/').pop()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {resource.type} • {formatTime(resource.loadTime)}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {formatSize(resource.size)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.networkCalls.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Network monitoring requires same-origin access</p>
                  <p className="text-sm">Try testing a page from your own domain</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {metrics.networkCalls.map((call, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{call.method} {call.url}</div>
                          <div className="text-xs text-muted-foreground">
                            Status: {call.status} • {formatTime(call.responseTime)} • {formatSize(call.size)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cookies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookies ({metrics.cookies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.cookies.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No cookies found
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {metrics.cookies.map((cookie, index) => (
                      <div key={index} className="py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{cookie.name}</span>
                          <Badge variant="outline">{cookie.domain}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {cookie.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  Browser Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">User Agent:</span>
                  <div className="text-muted-foreground text-xs mt-1 break-all">
                    {metrics.userAgent}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4" />
                  Viewport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Size:</span>
                  <span className="ml-2">{metrics.viewport.width} × {metrics.viewport.height}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Headers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {Object.entries(metrics.headers).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium w-32 flex-shrink-0">{key}:</span>
                    <span className="text-muted-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};