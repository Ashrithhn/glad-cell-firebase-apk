'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, XCircle, Loader2, CameraOff, Video, FileDown } from 'lucide-react'; // Added FileDown icon
import { useToast } from '@/hooks/use-toast';
import { saveAttendanceRecord } from '@/services/attendance'; // Importing saveAttendanceRecord
// We would need a QR scanner library. For this example, we'll simulate scanning.
// Popular libraries: react-qr-reader, html5-qrcode
// For now, we'll use a simple text input to simulate scanning QR data.

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
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // For actual camera scanning (conceptual - would require a library)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Keep track of scanned order IDs
  const [scannedOrderIds, setScannedOrderIds] = useState<Set<string>>(new Set());
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]); // To store attendance records


  // Placeholder for starting camera scan
  const startCameraScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setParsedData(null);
    // In a real app, initialize QR scanner library here
    toast({ title: "Camera Scan Started", description: "Point camera at QR code. (This is a placeholder)"});

    // Simulate finding a QR code after a delay for demo purposes
    // setTimeout(() => {
    //   if (isScanning) {
    //     const mockQrData = JSON.stringify({orderId: "order_mock_123", eventId: "event_abc", userId: "user_xyz", timestamp: Date.now()});
    //     handleQrData(mockQrData);
    //     setIsScanning(false);
    //     toast({ title: "QR Code Detected (Mock)", description: "Processing..."});
    //   }
    // }, 3000);
  };

  // Placeholder for stopping camera scan
  const stopCameraScan = () => {
    setIsScanning(false);
    // In a real app, stop/release camera here
    toast({ title: "Camera Scan Stopped"});
  };

  // This function would be called by the QR scanner library with the decoded data
  const handleQrData = (data: string | null) => {
    if (data) {
      setScannedData(data);
      try {
        const jsonData = JSON.parse(data) as ScannedData;
        // Basic validation of expected fields
        if (jsonData.orderId && jsonData.eventId && jsonData.userId) {
          setParsedData(jsonData);
          setScanResult(null); // Clear previous results
        } else {
          throw new Error("Invalid QR code structure.");
        }
      } catch (error) {
        setParsedData(null);
        setScanResult({ type: 'error', message: 'Invalid QR code format. Please scan a valid event ticket.' });
        toast({title: "Invalid QR Code", description: "The scanned QR code is not in the expected format.", variant: "destructive"});
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

    // --- SIMULATED BACKEND LOGIC ---
    // In a real application, this would be a server action:
    // 1. Query 'participations' collection in Firestore for a document matching
    //    parsedData.orderId, parsedData.eventId, and parsedData.userId.
    // 2. Check if 'qrCodeDataUri' in the fetched document matches `scannedData` (or the parsed data itself).
    // 3. Check if already marked attended: add an 'attendedAt' timestamp field.
    // 4. If valid and not attended, update the document: set `attendedAt: serverTimestamp()`.
    // 5. Return success or error.
    
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
    }
    // --- END SIMULATED BACKEND LOGIC ---
    
    setIsLoading(false);
    // Clear input after processing for next scan
    setScannedData(''); 
    setParsedData(null);
  };

  // Effect for camera access (conceptual)
    useEffect(() => {
        // This is a placeholder. Actual camera access needs a library like html5-qrcode or react-qr-reader.
        const getCameraPermission = async () => {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              setHasCameraPermission(true);
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
               // Clean up stream on component unmount or when permission is no longer needed
              return () => {
                stream.getTracks().forEach(track => track.stop());
              };
            } catch (error) {
              console.error('Error accessing camera:', error);
              setHasCameraPermission(false);
              toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use QR scanning.',
              });
            }
          } else {
            setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access for QR scanning.',
              });
          }
        };

        // getCameraPermission(); // Call this when you want to initialize camera, e.g., on a button click
        // For now, we assume permission is checked/granted when "Start Scan" is clicked.
    }, []);

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
            Scan participant QR codes to mark attendance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Camera View Placeholder */}
          <div className="border rounded-md p-4 bg-muted aspect-video flex items-center justify-center">
            {isScanning && hasCameraPermission === true ? (
                 <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
            ) : hasCameraPermission === false && isScanning ? (
                <div className="text-center text-destructive">
                    <CameraOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera access denied or not available.</p>
                    <p className="text-xs">Please grant permission or use manual input.</p>
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera preview will appear here.</p>
                </div>
            )}
          </div>
           <div className="flex gap-2">
            <Button onClick={startCameraScan} disabled={isScanning} className="flex-1">
                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CameraOff className="mr-2 h-4 w-4"/>}
                {isScanning ? 'Scanning...' : 'Start Camera Scan'}
            </Button>
            {isScanning && <Button onClick={stopCameraScan} variant="outline">Stop Scan</Button>}
           </div>
           {hasCameraPermission === null && <p className="text-xs text-muted-foreground text-center">Click "Start Camera Scan" to request camera permission.</p>}


          <div className="space-y-2">
            <Label htmlFor="qr-data-manual">Manual QR Data Input</Label>
            <Input
              id="qr-data-manual"
              placeholder='Paste or type QR data here if camera fails'
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
                <QrCode className="h-5 w-5" /> QR Data Received
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-1 text-xs break-all">
                <p><strong>Order ID:</strong> {parsedData.orderId}</p>
                <p><strong>Event ID:</strong> {parsedData.eventId}</p>
                <p><strong>User ID:</strong> {parsedData.userId}</p>
                <Button onClick={verifyAndMarkAttendance} disabled={isLoading || scannedOrderIds.has(parsedData.orderId)} className="mt-4 w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify and Mark Attendance
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {scanResult && (
            <Alert variant={scanResult.type === 'success' ? 'default' : 'destructive'} className="mt-4">
              {scanResult.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <AlertTitle>{scanResult.type === 'success' ? 'Success!' : 'Error!'}</AlertTitle>
              <AlertDescription>{scanResult.message}</AlertDescription>
            </Alert>
          )}
        <Button onClick={downloadAttendanceData} variant="secondary" disabled={attendanceRecords.length === 0}>
            <FileDown className="mr-2 h-4 w-4"/> Download Attendance Data
        </Button>
        </CardContent>
      </Card>
    </div>
  );
}

