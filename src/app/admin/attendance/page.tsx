'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
<<<<<<< HEAD
import { QrCode, CheckCircle, XCircle, Loader2, CameraOff, Video, FileDown } from 'lucide-react'; // Added FileDown icon
import { useToast } from '@/hooks/use-toast';
import { saveAttendanceRecord } from '@/services/attendance'; // Importing saveAttendanceRecord
// We would need a QR scanner library. For this example, we'll simulate scanning.
// Popular libraries: react-qr-reader, html5-qrcode
// For now, we'll use a simple text input to simulate scanning QR data.
=======
import { QrCode, CheckCircle, XCircle, Loader2, CameraOff, Video, Download, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { markAttendance, getEventParticipants } from '@/services/attendance'; // Import new service functions
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

interface ScannedData {
  orderId: string;
  eventId: string;
  userId: string;
  timestamp: number;
}

export default function AdminAttendancePage() {
  const { toast } = useToast();
  const [scannedData, setScannedData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ScannedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Keep track of scanned order IDs
  const [scannedOrderIds, setScannedOrderIds] = useState<Set<string>>(new Set());
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]); // To store attendance records


  const startCameraScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setParsedData(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            setHasCameraPermission(true);
            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // TODO: Integrate a QR scanning library here to process the video stream
            // For example, using html5-qrcode:
            // const html5QrCode = new Html5Qrcode("qr-video-reader");
            // html5QrCode.start(
            //   { facingMode: "environment" },
            //   { fps: 10, qrbox: 250 },
            //   (decodedText) => { handleQrData(decodedText); html5QrCode.stop(); setIsScanning(false); },
            //   (errorMessage) => { console.warn(`QR error: ${errorMessage}`); }
            // ).catch(err => console.error("Unable to start scanning.", err));
            }
            toast({ title: "Camera Scan Started", description: "Point camera at QR code. (Scanning library not fully integrated)"});
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({ variant: 'destructive', title: 'Camera Access Denied/Error', description: 'Please enable camera permissions or check camera connection.'});
            setIsScanning(false);
        }
    } else {
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Not Supported', description: 'Your browser does not support camera access.'});
        setIsScanning(false);
    }
  };

  const stopCameraScan = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    // If using a library like html5-qrcode, call its stop method here.
    toast({ title: "Camera Scan Stopped"});
  };

  const handleQrData = (data: string | null) => {
    if (data) {
      setScannedData(data);
      try {
        const jsonData = JSON.parse(data) as ScannedData;
        if (jsonData.orderId && jsonData.eventId && jsonData.userId && jsonData.timestamp) {
          setParsedData(jsonData);
          setScanResult(null); 
        } else {
          throw new Error("Invalid QR code structure. Missing required fields.");
        }
      } catch (error) {
        setParsedData(null);
        const msg = error instanceof Error ? error.message : 'Invalid QR code format.';
        setScanResult({ type: 'error', message: `Invalid QR code: ${msg}` });
        toast({title: "Invalid QR Code", description: msg, variant: "destructive"});
      }
    } else {
       setScanResult({ type: 'error', message: 'Failed to read QR code.' });
       toast({title: "Scan Error", description: "Could not read the QR code.", variant: "destructive"});
    }
  };

  const handleManualSubmit = () => {
    if (!scannedData.trim()) {
        toast({ title: "Input Empty", description: "Please enter QR data manually.", variant: "destructive"});
        return;
    }
    handleQrData(scannedData);
  };
  
  const verifyAndMarkAttendance = async () => {
    if (!parsedData) {
      toast({ title: "No Data", description: "No QR data to verify.", variant: "destructive" });
      return;
    }

    const orderId = parsedData.orderId;
    if (scannedOrderIds.has(orderId)) {
        toast({ title: "Already Scanned", description: "This ticket has already been used.", variant: "destructive" });
        setScanResult({ type: 'error', message: `Order ID: ${orderId} has already been scanned.` });
        setScannedData(''); // Clear input after processing for next scan
        setParsedData(null);
        return;
    }

    setIsLoading(true);
    setScanResult(null);
    
<<<<<<< HEAD
    console.log("Verifying attendance for:", parsedData);
    // await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Call saveAttendanceRecord instead of simulated logic
    const result = await saveAttendanceRecord(parsedData.orderId, parsedData.eventId, parsedData.userId, scannedData);


    if (result.success) {
        setScannedOrderIds(prev => new Set(prev.add(orderId)));
        setScanResult({ type: 'success', message: `Attendance marked for Order ID: ${orderId}. Welcome!` });
        toast({ title: "Attendance Marked", description: `User ${parsedData.userId} for event ${parsedData.eventId} marked present.` });
        // Add the attendance record to the local state
        setAttendanceRecords(prev => [...prev, parsedData]);

    } else {
      setScanResult({ type: 'error', message: `Verification failed for Order ID: ${orderId}. Ticket might be invalid or already used.` });
      toast({ title: "Verification Failed", description: result.message || "Could not mark attendance. Please check the ticket or try again.", variant: "destructive"});
=======
    const result = await markAttendance(parsedData.eventId, parsedData.userId, parsedData.orderId);

    if (result.success) {
      setScanResult({ type: 'success', message: `Attendance marked for Order ID: ${parsedData.orderId}. Welcome!` });
      toast({ title: "Attendance Marked", description: `User ${parsedData.userId} for event ${parsedData.eventId} marked present.`});
    } else if (result.message?.includes("already marked")) {
      setScanResult({ type: 'warning', message: result.message });
      toast({ title: "Already Attended", description: result.message, variant: "default" }); // Use default variant for warning-like info
    } else {
      setScanResult({ type: 'error', message: result.message || `Verification failed for Order ID: ${parsedData.orderId}.` });
      toast({ title: "Verification Failed", description: result.message || "Could not mark attendance.", variant: "destructive"});
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
    }
    
    setIsLoading(false);
    setScannedData(''); 
    setParsedData(null);
  };
  
  const handleDownloadParticipants = async (eventId: string, eventName: string) => {
    // Placeholder: In a real app, you'd fetch detailed participant data for the event
    // and then convert it to CSV/Excel for download.
    setIsLoading(true);
    toast({ title: "Generating Report", description: `Fetching participants for ${eventName}... (Not Implemented)`});
    // const participants = await getEventParticipants(eventId); // This service function needs to be created
    // if (participants.success && participants.data) {
    //    // Convert participants.data to CSV string
    //    // Create a blob and trigger download
    // } else {
    //    toast({ title: "Error", description: participants.message || "Could not fetch data.", variant: "destructive"});
    // }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate
    setIsLoading(false);
    alert(`Download functionality for event "${eventName}" (ID: ${eventId}) is not yet implemented.\nThis would typically generate a CSV/Excel file of attendees.`);
  };

  const downloadAttendanceData = () => {
        if (attendanceRecords.length === 0) {
            toast({ title: "No Data", description: "No attendance records to download.", variant: "destructive" });
            return;
        }

        const csvRows = [];
        const headers = Object.keys(attendanceRecords[0]);
        csvRows.push(headers.join(','));

        for (const record of attendanceRecords) {
            const values = headers.map(header => {
                const value = record[header];
                return typeof value === 'string' ? `"${value}"` : value; // Escape strings with quotes
            });
            csvRows.push(values.join(','));
        }

        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <QrCode className="h-6 w-6" /> Event Attendance Scanner
          </CardTitle>
          <CardDescription>
            Scan participant QR codes to mark attendance. You can also manually input QR data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="border rounded-md p-4 bg-muted aspect-video flex items-center justify-center">
            {isScanning && hasCameraPermission ? (
                 <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
            ) : hasCameraPermission === false && isScanning ? (
                <div className="text-center text-destructive">
                    <CameraOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera access denied or not available.</p>
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera preview will appear here when scan starts.</p>
                </div>
            )}
          </div>
           <div className="flex gap-2">
            <Button onClick={startCameraScan} disabled={isScanning || isLoading} className="flex-1">
                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <QrCode className="mr-2 h-4 w-4"/>}
                {isScanning ? 'Scanning...' : 'Start Camera Scan'}
            </Button>
            {isScanning && <Button onClick={stopCameraScan} variant="outline" disabled={isLoading}>Stop Scan</Button>}
           </div>
           {hasCameraPermission === null && <p className="text-xs text-muted-foreground text-center">Click "Start Camera Scan" to request camera permission.</p>}


          <div className="space-y-2">
            <Label htmlFor="qr-data-manual">Manual QR Data Input</Label>
            <Input
              id="qr-data-manual"
              placeholder='Paste or type QR data here'
              value={scannedData}
              onChange={(e) => setScannedData(e.target.value)}
              disabled={isLoading || isScanning}
            />
            <Button onClick={handleManualSubmit} disabled={isLoading || isScanning || !scannedData.trim()} className="w-full sm:w-auto">
                Submit Manual Data
            </Button>
          </div>

          {parsedData && !scanResult && (
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> QR Data Ready for Verification
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-1 text-xs break-all">
                <p><strong>Order ID:</strong> {parsedData.orderId}</p>
                <p><strong>Event ID:</strong> {parsedData.eventId}</p>
                <p><strong>User ID:</strong> {parsedData.userId}</p>
<<<<<<< HEAD
                <Button onClick={verifyAndMarkAttendance} disabled={isLoading || scannedOrderIds.has(parsedData.orderId)} className="mt-4 w-full">
=======
                <p><strong>Timestamp:</strong> {new Date(parsedData.timestamp).toLocaleString()}</p>
                <Button onClick={verifyAndMarkAttendance} disabled={isLoading} className="mt-4 w-full">
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify and Mark Attendance
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {scanResult && (
            <Alert variant={scanResult.type === 'success' ? 'default' : (scanResult.type === 'warning' ? 'default' : 'destructive')} className={`mt-4 ${scanResult.type === 'warning' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700' : ''}`}>
              {scanResult.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> : (scanResult.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-600" /> : <XCircle className="h-5 w-5 text-red-600" />)}
              <AlertTitle className={scanResult.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' : ''}>
                {scanResult.type === 'success' ? 'Success!' : (scanResult.type === 'warning' ? 'Notice' : 'Error!')}
              </AlertTitle>
              <AlertDescription className={scanResult.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' : ''}>
                {scanResult.message}
              </AlertDescription>
            </Alert>
          )}
<<<<<<< HEAD
        <Button onClick={downloadAttendanceData} variant="secondary" disabled={attendanceRecords.length === 0}>
            <FileDown className="mr-2 h-4 w-4"/> Download Attendance Data
        </Button>
=======
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        </CardContent>
      </Card>

      {/* Placeholder for Participant Data Download */}
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Download className="h-5 w-5" /> Participant Data
          </CardTitle>
          <CardDescription>
            Download attendance reports for events. (Functionality Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <Label htmlFor="event-id-download">Event ID for Report</Label>
            <Input id="event-id-download" placeholder="Enter Event ID (e.g., from events list)" />
            <Button 
                onClick={() => {
                    const eventId = (document.getElementById('event-id-download') as HTMLInputElement)?.value;
                    if (eventId) {
                        handleDownloadParticipants(eventId, `Event ${eventId}`);
                    } else {
                        toast({title: "Missing Event ID", description: "Please enter an Event ID to download the report.", variant: "destructive"});
                    }
                }} 
                disabled={isLoading} 
                className="w-full sm:w-auto"
            >
                <Users className="mr-2 h-4 w-4" /> Download Report (Placeholder)
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}

