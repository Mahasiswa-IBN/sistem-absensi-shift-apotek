<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST");

$db_file = __DIR__ . '/database.json';

// Initialize default database records if file is missing
if (!file_exists($db_file)) {
    // Generate dates dynamically for current calendar view
    $today = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    $tomorrow = date('Y-m-d', strtotime('+1 day'));

    $mock_avatars = [
        'sarah' => 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2310b981"><circle cx="50" cy="35" r="20"/><path d="M50 60c-20 0-35 12-35 25h70c0-13-15-25-35-25z"/></svg>',
        'budi' => 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%233b82f6"><circle cx="50" cy="35" r="20"/><path d="M50 60c-18 0-32 10-35 22h70c-3-12-17-22-35-22z"/></svg>',
        'citra' => 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23fbbf24"><circle cx="50" cy="35" r="20"/><path d="M50 60c-20 0-35 12-35 25h70c0-13-15-25-35-25z"/></svg>',
        'dedi' => 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f43f5e"><circle cx="50" cy="35" r="20"/><path d="M50 60c-18 0-32 10-35 22h70c-3-12-17-22-35-22z"/></svg>'
    ];

    $default_data = [
        'employees' => [
            [ 'id' => 'AP-2026-001', 'name' => 'apt. Sarah Amalia, S.Farm.', 'role' => 'Apoteker Utama', 'avatar' => $mock_avatars['sarah'] ],
            [ 'id' => 'AP-2026-002', 'name' => 'Budi Pratama', 'role' => 'Asisten Apoteker', 'avatar' => $mock_avatars['budi'] ],
            [ 'id' => 'AP-2026-003', 'name' => 'Citra Dewi', 'role' => 'Kasir Apotek', 'avatar' => $mock_avatars['citra'] ],
            [ 'id' => 'AP-2026-004', 'name' => 'Dedi Kurniawan', 'role' => 'Staf Logistik', 'avatar' => $mock_avatars['dedi'] ]
        ],
        'schedules' => [
            [ 'id' => 'S-1', 'empId' => 'AP-2026-002', 'empName' => 'Budi Pratama', 'date' => $yesterday, 'shift' => 'Pagi', 'time' => '08:00 - 16:00', 'status' => 'Selesai' ],
            [ 'id' => 'S-2', 'empId' => 'AP-2026-001', 'empName' => 'apt. Sarah Amalia, S.Farm.', 'date' => $yesterday, 'shift' => 'Siang', 'time' => '14:00 - 22:00', 'status' => 'Selesai' ],
            [ 'id' => 'S-3', 'empId' => 'AP-2026-001', 'empName' => 'apt. Sarah Amalia, S.Farm.', 'date' => $today, 'shift' => 'Pagi', 'time' => '08:00 - 16:00', 'status' => 'Hadir' ],
            [ 'id' => 'S-4', 'empId' => 'AP-2026-002', 'empName' => 'Budi Pratama', 'date' => $today, 'shift' => 'Siang', 'time' => '14:00 - 22:00', 'status' => 'Siap' ],
            [ 'id' => 'S-5', 'empId' => 'AP-2026-003', 'empName' => 'Citra Dewi', 'date' => $today, 'shift' => 'Malam', 'time' => '22:00 - 08:00', 'status' => 'Siap' ],
            [ 'id' => 'S-6', 'empId' => 'AP-2026-003', 'empName' => 'Citra Dewi', 'date' => $tomorrow, 'shift' => 'Pagi', 'time' => '08:00 - 16:00', 'status' => 'Siap' ],
            [ 'id' => 'S-7', 'empId' => 'AP-2026-004', 'empName' => 'Dedi Kurniawan', 'date' => $tomorrow, 'shift' => 'Siang', 'time' => '14:00 - 22:00', 'status' => 'Siap' ]
        ],
        'handovers' => [
            [
                'id' => 'HO-1',
                'date' => $yesterday,
                'time' => '16:00',
                'empOutId' => 'AP-2026-002',
                'empOutName' => 'Budi Pratama',
                'empInId' => 'AP-2026-001',
                'empInName' => 'apt. Sarah Amalia, S.Farm.',
                'notes' => 'Serah terima shift pagi ke siang berjalan lancar. Seluruh resep tunai telah diinput. Uang kas laci klop Rp 1.500.000.',
                'stocks' => [
                    [ 'name' => 'Amoxicillin 500mg (Tablet)', 'count' => 20, 'reason' => 'Tinggal 2 box di lemari depan, silakan order ke PBF.' ]
                ],
                'issues' => [],
                'photo' => $mock_avatars['budi']
            ]
        ],
        'attendance' => [
            [ 'id' => 'A-1', 'empId' => 'AP-2026-002', 'empName' => 'Budi Pratama', 'date' => $yesterday, 'time' => '07:54:12', 'type' => 'Clock In', 'shift' => 'Pagi', 'photo' => $mock_avatars['budi'] ],
            [ 'id' => 'A-2', 'empId' => 'AP-2026-002', 'empName' => 'Budi Pratama', 'date' => $yesterday, 'time' => '16:05:43', 'type' => 'Clock Out', 'shift' => 'Pagi', 'photo' => $mock_avatars['budi'] ],
            [ 'id' => 'A-3', 'empId' => 'AP-2026-001', 'empName' => 'apt. Sarah Amalia, S.Farm.', 'date' => $yesterday, 'time' => '13:58:30', 'type' => 'Clock In', 'shift' => 'Siang', 'photo' => $mock_avatars['sarah'] ],
            [ 'id' => 'A-4', 'empId' => 'AP-2026-001', 'empName' => 'apt. Sarah Amalia, S.Farm.', 'date' => $yesterday, 'time' => '22:02:11', 'type' => 'Clock Out', 'shift' => 'Siang', 'photo' => $mock_avatars['sarah'] ],
            [ 'id' => 'A-5', 'empId' => 'AP-2026-001', 'empName' => 'apt. Sarah Amalia, S.Farm.', 'date' => $today, 'time' => '07:49:52', 'type' => 'Clock In', 'shift' => 'Pagi', 'photo' => $mock_avatars['sarah'] ]
        ],
        'session' => [
            'empId' => 'AP-2026-001',
            'empName' => 'apt. Sarah Amalia, S.Farm.',
            'role' => 'Apoteker Utama',
            'shiftId' => 'S-3',
            'shiftName' => 'Pagi',
            'clockInTime' => '07:49:52'
        ]
    ];
    file_put_contents($db_file, json_encode($default_data, JSON_PRETTY_PRINT));
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'load') {
        if (file_exists($db_file)) {
            echo file_get_contents($db_file);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Database tidak ditemukan']);
        }
        exit;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'save' && is_array($input)) {
        if (file_exists($db_file)) {
            $data = json_decode(file_get_contents($db_file), true);
        } else {
            $data = [];
        }

        // Merge key values from payload
        foreach ($input as $key => $val) {
            $data[$key] = $val;
        }

        file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success']);
        exit;
    }
}

echo json_encode(['status' => 'error', 'message' => 'Permintaan tidak valid']);
?>
