
'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, CheckCircle, XCircle, Loader2, CameraOff, Video, User, Mail, Hash, GraduationCap, Calendar as CalendarIcon, ScanLine, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { markAttendance } from '@/services/attendance';
import { getAdminEvents } from '@/services/events';
import type { EventData } from '@/services/events';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ScannedData {
  orderId: string;
  eventId: string;
  userId: string;
  timestamp: number;
}

interface ParticipantDetails {
    user_name: string;
    user_email: string;
    user_branch: string;
    user_semester: number;
    user_registration_number: string;
    event_name: string;
    attended_at?: string | null;
}

function AttendanceScannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [scannedParticipant, setScannedParticipant] = useState<ParticipantDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);
  const scannerRegionId = "qr-code-full-region";

  useEffect(() => {
    isMounted.current = true;
    const eventIdFromQuery = searchParams.get('eventId');
    if (eventIdFromQuery) {
      setSelectedEventId(eventIdFromQuery);
    }

    getAdminEvents().then(result => {
      if (isMounted.current) {
        if (result.success && result.events) {
          setEvents(result.events.filter(e => e.status === 'Active')); // Only show active events
        } else {
          toast({ title: "Could not load events", description: result.message, variant: "destructive" });
        }
        setLoadingEvents(false);
      }
    });

    return () => {
      isMounted.current = false;
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop().catch(err => console.error("Cleanup failed to stop scanner:", err));
      }
    };
  }, [searchParams, toast]);

  const stopScanner = useCallback((showToast = true) => {
    if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      return scannerRef.current.stop().then(() => {
        if (!isMounted.current) return;
        setIsScannerActive(false);
        if(showToast) toast({ title: "Scanner Stopped" });
      }).catch(err => {
        console.error("Failed to stop scanner:", err);
        if (isMounted.current) setIsScannerActive(false);
      });
    } else {
      if (isMounted.current) setIsScannerActive(false);
      return Promise.resolve();
    }
  }, [toast]);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (isLoading || !selectedEventId) return;

    // Immediately stop scanner to prevent re-scans of the same code
    await stopScanner(false);
    setIsLoading(true);
    setScanResult(null);
    setScannedParticipant(null);

    let parsedData: ScannedData;
    try {
      parsedData = JSON.parse(decodedText) as ScannedData;
      if (!parsedData.orderId || !parsedData.eventId || !parsedData.userId) {
        throw new Error("Invalid QR code structure.");
      }
      if (parsedData.eventId !== selectedEventId) {
        const scannedEventName = events.find(e => e.id === parsedData.eventId)?.name || 'another event';
        throw new Error(`This ticket is for "${scannedEventName}", not the selected event.`);
      }
    } catch (error) {
      if (!isMounted.current) return;
      setScanResult({ type: 'error', message: `Invalid QR Code: ${error instanceof Error ? error.message : 'Unknown format.'}`});
      toast({ title: "Invalid QR Code", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const result = await markAttendance(parsedData.eventId, parsedData.userId, parsedData.orderId);

    if (!isMounted.current) return;

    if (result.success || (result.participant && result.message?.includes('Already marked'))) {
        setScanResult({ type: result.success ? 'success' : 'warning', message: result.message || 'Scan complete.' });
        setScannedParticipant(result.participant || null);
        toast({ title: result.success ? "Attendance Marked" : "Already Attended", description: result.message });
    } else {
        setScanResult({ type: 'error', message: result.message || 'Verification failed.' });
        setScannedParticipant(null);
        toast({ title: "Verification Failed", description: result.message, variant: "destructive" });
    }
    setIsLoading(false);
  }, [isLoading, toast, stopScanner, selectedEventId, events]);

  const handleScanError = useCallback((errorMessage: string) => { /* Ignore frequent errors */ }, []);

  const startScanner = useCallback(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerRegionId, { verbose: false });
    }
    if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) return;

    setScanResult(null);
    setScannedParticipant(null);

    const config = { fps: 10 };

    scannerRef.current.start({ facingMode: "environment" }, config, handleScanSuccess, handleScanError)
      .then(() => {
        if (isMounted.current) setIsScannerActive(true);
        toast({ title: "Scanner Started", description: "Point camera at a QR code." });
      })
      .catch(err => {
        toast({ variant: 'destructive', title: 'Unable to Start Scanner', description: 'Please check camera permissions.' });
        if (isMounted.current) setIsScannerActive(false);
      });
  }, [handleScanSuccess, handleScanError, toast]);

  const handleEventSelect = (eventId: string) => {
    stopScanner(false);
    setScanResult(null);
    setScannedParticipant(null);
    setSelectedEventId(eventId);
    router.push(`/admin/attendance?eventId=${eventId}`);
  };

  const renderStatusIcon = () => {
    if (!scanResult) return null;
    switch(scanResult.type) {
        case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
        case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        case 'error': return <XCircle className="h-6 w-6 text-destructive" />;
    }
  };

  const selectedEventName = events.find(e => e.id === selectedEventId)?.name;

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <QrCode className="h-6 w-6" /> Event Attendance Scanner
          </CardTitle>
          <CardDescription>
            Select an event, then scan participant QR codes to mark attendance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="event-select" className="font-medium">Select Event</label>
            <Select
              value={selectedEventId || ""}
              onValueChange={handleEventSelect}
              disabled={loadingEvents || isScannerActive}
            >
              <SelectTrigger id="event-select" className="w-full">
                <SelectValue placeholder="Select an active event to begin..." />
              </SelectTrigger>
              <SelectContent>
                {loadingEvents ? <SelectItem value="loading" disabled><Loader2 className="animate-spin" /> Loading events...</SelectItem> :
                  events.length > 0 ? events.map(event => (
                    <SelectItem key={event.id!} value={event.id!}>{event.name}</SelectItem>
                  )) : <SelectItem value="no-events" disabled>No active events found.</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {selectedEventId && (
            <div className="space-y-4">
              <div className="border rounded-md bg-muted w-full max-w-md mx-auto aspect-[3/4] sm:aspect-video relative overflow-hidden">
                <div id={scannerRegionId} className="absolute inset-0" />

                {!isScannerActive && !isLoading && !scannedParticipant && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                        <Video className="h-12 w-12 mx-auto mb-2" />
                        <p>Camera preview will appear here.</p>
                        <p className="text-xs">Scanning for: <strong>{selectedEventName}</strong></p>
                    </div>
                )}

                {isScannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[85%] h-[65%] border-4 border-primary/50 rounded-lg animate-pulse" />
                    </div>
                )}
              </div>

              <div className="flex gap-4">
                {!isScannerActive ? (
                  <Button onClick={startScanner} disabled={isLoading} className="flex-1">
                    <ScanLine className="mr-2 h-4 w-4"/> {scannedParticipant ? 'Scan Next Ticket' : 'Start Scanning'}
                  </Button>
                ) : (
                  <Button onClick={() => stopScanner()} variant="outline" className="flex-1">
                    <CameraOff className="mr-2 h-4 w-4"/> Stop Scanner
                  </Button>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <Alert>
              <Loader2 className="h-5 w-5 animate-spin"/>
              <AlertTitle>Verifying QR Code...</AlertTitle>
              <AlertDescription>Please wait while we check the ticket details.</AlertDescription>
            </Alert>
          )}

          {!isLoading && scanResult && (
            <div className="space-y-4">
              <Alert variant={scanResult.type === 'error' ? 'destructive' : 'default'} className={scanResult.type === 'success' ? 'border-green-500' : scanResult.type === 'warning' ? 'border-yellow-500' : ''}>
                {renderStatusIcon()}
                <AlertTitle>{scanResult.type.charAt(0).toUpperCase() + scanResult.type.slice(1)}</AlertTitle>
                <AlertDescription>{scanResult.message}</AlertDescription>
              </Alert>

              {scannedParticipant && (
                <Card className="bg-muted/50">
                  <CardHeader><CardTitle className="text-lg">Participant Details</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm overflow-x-auto">
                    <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground shrink-0"/><strong>Name:</strong> <span className="truncate">{scannedParticipant.user_name}</span></div>
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground shrink-0"/><strong>Email:</strong> <span className="truncate">{scannedParticipant.user_email}</span></div>
                    <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-muted-foreground shrink-0"/><strong>Reg No:</strong> <span className="truncate">{scannedParticipant.user_registration_number}</span></div>
                    <Separator />
                    <div className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-muted-foreground shrink-0"/><strong>Branch:</strong> <span className="truncate">{scannedParticipant.user_branch} (Sem {scannedParticipant.user_semester})</span></div>
                    <div className="flex items-center gap-3"><CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0"/><strong>Event:</strong> <span className="truncate">{scannedParticipant.event_name}</span></div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <strong className="shrink-0">Status:</strong>
                      {scannedParticipant.attended_at ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Attended at {format(parseISO(scannedParticipant.attended_at), 'p')}
                        </Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/> Not Yet Attended</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuspendedAttendancePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <AttendanceScannerPage/>
        </Suspense>
    )
}
