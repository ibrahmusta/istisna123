import React, { useState, useEffect, useRef } from 'react';
import { Store, Map, Box, User, Eraser, Layers, Grid, Hammer, X, Monitor, ShoppingBag, ShoppingCart, ChevronDown, Package, Menu, Ruler, ArrowUp, LogIn, RotateCcw, RotateCw, ArrowDown, ArrowLeft, ArrowRight, Server, Snowflake, Leaf, Calculator, Users, LayoutGrid, DoorOpen, Shield, Lightbulb, Camera, Megaphone, Image as ImageIcon, Tag, TreePine, Eye, Compass, Route, TriangleAlert, Crosshair, Type, Settings } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // View & UI States
  const [is3D, setIs3D] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('market'); 
  const [marketW, setMarketW] = useState(20);
  const [marketH, setMarketH] = useState(20);
  const [depotW, setDepotW] = useState(20);
  const [depotH, setDepotH] = useState(10);
  const [cellSize, setCellSize] = useState(1);
  const [cellPx, setCellPx] = useState(30);

  const [marketCeilingHeight, setMarketCeilingHeight] = useState(3.5);
  const [depotCeilingHeight, setDepotCeilingHeight] = useState(5.0);
  const [cameraMode, setCameraMode] = useState('isometric');
  const [isRulerMenuOpen, setIsRulerMenuOpen] = useState(false); // Cetvel Menüsü

  const mainContainerRef = useRef(null); // İnsan modu fare kilidi için eklendi

  // İnsan Karakteri (FPS) State'leri
  const [charPos, setCharPos] = useState({ x: 300, y: 300 });
  const [charYaw, setCharYaw] = useState(0);
  const [charPitch, setCharPitch] = useState(90);
  const [isCharMoving, setIsCharMoving] = useState(false);

  const charPosRef = useRef(charPos);
  useEffect(() => { charPosRef.current = charPos; }, [charPos]);
  const charYawRef = useRef(charYaw);
  useEffect(() => { charYawRef.current = charYaw; }, [charYaw]);
  const isCharMovingRef = useRef(isCharMoving);
  useEffect(() => { isCharMovingRef.current = isCharMoving; }, [isCharMoving]);

  // Hassas Taşıma, Ölçüm ve Çarpışma State'leri
  const [measurements, setMeasurements] = useState([]);
  const [measuringPoint, setMeasuringPoint] = useState(null);
  const [moveStep, setMoveStep] = useState(0.1); 

  // Güzergâh ve Ölçüm Birimi
  const [measurementUnit, setMeasurementUnit] = useState('m'); 
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null); 
  const activeRouteRef = useRef(null);
  const measuringPointRef = useRef(null);
  const pendingPaintRef = useRef(null);
  
  useEffect(() => { activeRouteRef.current = activeRoute; }, [activeRoute]);
  useEffect(() => { measuringPointRef.current = measuringPoint; }, [measuringPoint]);

  // Tools Data definition
  const categories = [
    {
      id: 'guzergah',
      name: 'GÜZERGÂH',
      icon: Route,
      tools: [
        { id: 'gecisYolu', title: 'Koridor / Geçiş Yolu İşaretle', icon: Route, color: 'bg-green-100', border: 'border-green-400 text-green-700', type: 'route' },
        { id: 'tahliyeYolu', title: 'Acil Tahliye Yolu İşaretle', icon: TriangleAlert, color: 'bg-red-100', border: 'border-red-400 text-red-700', type: 'route' }
      ]
    },
    {
      id: 'market_araclari',
      name: 'Market İçi Reyonlar',
      icon: Store,
      tools: [
        { id: 'reyon', title: 'Raf / Gondol', icon: Server, color: 'bg-slate-300', border: 'border-slate-400', type: 'object', defW: 1, defH: 4, zHeight: '90px', zHeightMeters: 2.2, stackable: false },
        { id: 'kasap', title: 'Kasap Vitrini', icon: Snowflake, color: 'bg-red-200', border: 'border-red-400 text-red-700', type: 'object', defW: 1, defH: 3, zHeight: '32px', zHeightMeters: 1.1, stackable: false },
        { id: 'manav', title: 'Manav Tezgahı', icon: Leaf, color: 'bg-green-200', border: 'border-green-400 text-green-700', type: 'object', defW: 2, defH: 2, zHeight: '26px', zHeightMeters: 0.9, stackable: false },
        { id: 'kasa', title: 'Ödeme Kasası', icon: Calculator, color: 'bg-yellow-200', border: 'border-yellow-400 text-yellow-700', type: 'object', defW: 2, defH: 2, zHeight: '22px', zHeightMeters: 0.8, stackable: true },
        { id: 'personel', title: 'Çalışan (Personel)', icon: Users, color: 'bg-transparent', border: 'border-blue-400 border-dashed text-blue-500', type: 'figure', defW: 1, defH: 1, zHeight: '45px', zHeightMeters: 1.7, stackable: false, stackOn: ['marketZemini', 'depoZemini'] }
      ]
    },
    {
      id: 'market_aydinlatma',
      name: 'Aydınlatma & Tavan',
      icon: Lightbulb,
      tools: [
        { id: 'tepeLambasi', title: 'Spot Tepe Aydınlatma', icon: Lightbulb, color: 'bg-yellow-100', border: 'border-yellow-400 text-yellow-600', type: 'object', defW: 1, defH: 1, zHeight: '6px', zHeightMeters: 0.1, floatZ: 95, floatZMeters: 3.4 },
        { id: 'sarkanLamba', title: 'Sarkan Dekoratif Lamba', icon: Lightbulb, color: 'bg-orange-100', border: 'border-orange-400 text-orange-600', type: 'object', defW: 1, defH: 1, zHeight: '25px', zHeightMeters: 0.5, floatZ: 75, floatZMeters: 2.5 },
        { id: 'neonTabela', title: 'Duvar Tipi Neon Tabela', icon: Megaphone, color: 'bg-cyan-100', border: 'border-cyan-400 text-cyan-600', type: 'object', defW: 2, defH: 1, zHeight: '15px', zHeightMeters: 0.4, floatZ: 50, floatZMeters: 1.8 }
      ]
    },
    {
      id: 'market_dekorasyon',
      name: 'Dekor & Afişler',
      icon: Tag,
      tools: [
        { id: 'masa', title: 'Teşhir / Promosyon Masası', icon: Box, color: 'bg-amber-200', border: 'border-amber-600 text-amber-800', type: 'object', defW: 2, defH: 1, zHeight: '18px', zHeightMeters: 0.75, stackable: true },
        { id: 'reklamPanosu', title: 'Ayaklı Reklam Panosu', icon: ImageIcon, color: 'bg-red-100', border: 'border-red-500 text-red-700', type: 'object', defW: 1, defH: 1, zHeight: '45px', zHeightMeters: 1.8, stackable: false },
        { id: 'cicek', title: 'Saksı Bitkisi / Çiçek', icon: TreePine, color: 'bg-green-100', border: 'border-green-600 text-green-800', type: 'object', defW: 1, defH: 1, zHeight: '35px', zHeightMeters: 1.2, stackOn: ['marketZemini', 'depoZemini', 'masa', 'kasa'] },
        { id: 'kareKolon', title: 'Kare Kolon (Taşıyıcı)', icon: Box, color: 'bg-stone-200', border: 'border-stone-500 text-stone-700', type: 'object', defW: 1, defH: 1, zHeight: '120px', zHeightMeters: 4.0, stackable: true },
        { id: 'yuvarlakKolon', title: 'Yuvarlak Kolon', icon: Box, color: 'bg-stone-200', border: 'border-stone-500 text-stone-700', type: 'object', defW: 1, defH: 1, zHeight: '120px', zHeightMeters: 4.0, stackable: true, isOval: true }
      ]
    },
    {
      id: 'market_guvenlik',
      name: 'Giriş & Güvenlik',
      icon: Shield,
      tools: [
        { id: 'kapi', title: 'Otomatik Giriş Kapısı', icon: DoorOpen, color: 'bg-cyan-100', border: 'border-cyan-400 text-cyan-700', type: 'object', defW: 2, defH: 1, zHeight: '55px', zHeightMeters: 2.2, stackable: false },
        { id: 'turnike', title: 'Müşteri Yönlendirme Turnikesi', icon: Shield, color: 'bg-slate-300', border: 'border-slate-500 text-slate-700', type: 'object', defW: 1, defH: 1, zHeight: '20px', zHeightMeters: 0.9, stackable: false },
        { id: 'kamera', title: 'Güvenlik Kamerası', icon: Camera, color: 'bg-gray-100', border: 'border-gray-500 text-gray-700', type: 'object', defW: 1, defH: 1, zHeight: '12px', zHeightMeters: 0.2, floatZ: 85, floatZMeters: 3.0 },
        { id: 'camDuvar', title: 'Yarım Cam Duvar (Vitrin)', icon: LayoutGrid, color: 'bg-blue-100', border: 'border-blue-400 text-blue-700', type: 'object', defW: 2, defH: 1, zHeight: '40px', zHeightMeters: 1.5, stackable: false },
        { id: 'guvenlikOdasi', title: 'Güvenlik / İzleme Odası', icon: Eye, color: 'bg-slate-200', border: 'border-slate-500 text-slate-800', type: 'object', defW: 3, defH: 3, zHeight: '75px', zHeightMeters: 2.8, stackable: false }
      ]
    },
    {
      id: 'depo_araclari',
      name: 'Depo Malzemeleri',
      icon: Package,
      tools: [
        { id: 'depoRaf', title: 'Demir Depo Rafı', icon: Server, color: 'bg-indigo-300', border: 'border-indigo-400 text-indigo-700', type: 'object', defW: 1, defH: 4, zHeight: '110px', zHeightMeters: 4.0, stackable: true },
        { id: 'koli', title: 'İçecek / Ürün Kolisi', icon: Package, color: 'bg-amber-600', border: 'border-amber-800 text-amber-900', type: 'object', defW: 1, defH: 1, zHeight: '40px', zHeightMeters: 0.5, stackOn: ['marketZemini', 'depoZemini', 'palet', 'depoRaf', 'masa'] },
        { id: 'palet', title: 'Ahşap Palet', icon: LayoutGrid, color: 'bg-orange-300', border: 'border-orange-500 text-orange-800', type: 'object', defW: 2, defH: 2, zHeight: '10px', zHeightMeters: 0.15, stackable: true }
      ]
    }
  ];

  const hiddenTools = [
    { id: 'marketZemini', title: 'Market Zemini Çiz', icon: Hammer, type: 'base', defW: 1, defH: 1 },
    { id: 'depoZemini', title: 'Depo Zemini Çiz', icon: Hammer, type: 'base', defW: 1, defH: 1 },
    { id: 'zeminSil', title: 'Zemini Sil', icon: X, type: 'eraser_base', defW: 1, defH: 1 }
  ];

  const toolsMap = {
    olcumMesafe: { id: 'olcumMesafe', title: 'MESAFE ÖLÇ', icon: Ruler, color: 'bg-yellow-100', border: 'border-yellow-400 text-yellow-700', type: 'measure' }
  };
  categories.forEach(c => c.tools.forEach(t => toolsMap[t.id] = t));
  hiddenTools.forEach(t => toolsMap[t.id] = t);

  const [currentTool, setCurrentTool] = useState(null);
  const [brushW, setBrushW] = useState(1);
  const [brushH, setBrushH] = useState(1);
  const [brushRot, setBrushRot] = useState(0); 
  
  const [hoveredArea, setHoveredArea] = useState({ gridType: null, x: -1, y: -1 });

  const [marketGrid, setMarketGrid] = useState([]);
  const [depotGrid, setDepotGrid] = useState([]);

  const updateGridState = (gridType, newGrid) => {
      if (gridType === 'market') setMarketGrid(newGrid);
      else setDepotGrid(newGrid);
  };

  const [openCats, setOpenCats] = useState({ 'market_araclari': true, 'guzergah': true, 'market_aydinlatma': false, 'market_dekorasyon': false, 'market_guvenlik': false, 'depo_araclari': true });
  const toggleCat = (id) => setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));

  const [selectedCells, setSelectedCells] = useState([]); 
  const [expandedInspectorId, setExpandedInspectorId] = useState(null);
  const itemCounters = useRef({});

  const [globalWarning, setGlobalWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const warningTimeoutRef = useRef(null);

  const [showCeiling, setShowCeiling] = useState(true);
  const [showFloor, setShowFloor] = useState(true);

  // Kamera State'leri
  const [camRotX, setCamRotX] = useState(60);
  const [camRotZ, setCamRotZ] = useState(45);
  const [camPanX, setCamPanX] = useState(0);
  const [camPanY, setCamPanY] = useState(0);
  const [camZoom, setCamZoom] = useState(1);
  
  const isDraggingCam = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const dragSource = useRef(null); 
  const isFirstLayout = useRef(true);

  const camRotZRef = useRef(camRotZ);
  useEffect(() => { camRotZRef.current = camRotZ; }, [camRotZ]);
  const is3DRef = useRef(is3D);
  const cameraModeRef = useRef(cameraMode);
  const camZoomRef = useRef(camZoom);
  const marketGridRef = useRef(marketGrid);
  const depotGridRef = useRef(depotGrid);
  const activeTabRef = useRef(activeTab);
  const cellPxRef = useRef(cellPx);
  useEffect(() => { is3DRef.current = is3D; }, [is3D]);
  useEffect(() => { cameraModeRef.current = cameraMode; }, [cameraMode]);
  useEffect(() => { camZoomRef.current = camZoom; }, [camZoom]);
  useEffect(() => { marketGridRef.current = marketGrid; }, [marketGrid]);
  useEffect(() => { depotGridRef.current = depotGrid; }, [depotGrid]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { cellPxRef.current = cellPx; }, [cellPx]);
  const keysPressed = useRef({ w: false, a: false, s: false, d: false, q: false, e: false });

  // ARAÇLARIN KESİN İZOLASYONU (BİRİ AÇILINCA DİĞERİ KAPANIR)
  useEffect(() => {
      if (selectedCells.length > 0) {
          setCurrentTool(null);
          setIsRulerMenuOpen(false);
      }
  }, [selectedCells]);

  useEffect(() => {
      if (currentTool) {
          setSelectedCells([]); // Araç seçilince objeyi bırak
          if (currentTool !== 'olcumMesafe') setMeasuringPoint(null); // Mesafe aracı değilse ölçümü iptal et
          if (toolsMap[currentTool]?.type !== 'route') setActiveRoute(null); // Güzergah aracı değilse güzergahı iptal et
      } else {
          setMeasuringPoint(null);
          setActiveRoute(null);
      }
  }, [currentTool]);

  // FARE KİLİDİ (POINTER LOCK) YÖNETİMİ
  useEffect(() => {
      const handlePointerLockChange = () => {
          // ESC tuşuna basılıp kilit açılırsa, otomatik olarak genel 3D (İzometrik) görünüme dön
          if (document.pointerLockElement !== mainContainerRef.current) {
              if (cameraMode === 'human') {
                  setCameraMode('isometric');
              }
          }
      };

      const handleMouseMovePL = (e) => {
          // İnsan modundayken, sağ tuşa gerek kalmadan fare ile etrafa bakış
          if (document.pointerLockElement === mainContainerRef.current && cameraMode === 'human') {
              setCharYaw(prev => prev + e.movementX * 0.2);
              setCharPitch(prev => Math.max(10, Math.min(170, prev - e.movementY * 0.2)));
          }
      };

      document.addEventListener('pointerlockchange', handlePointerLockChange);
      document.addEventListener('mousemove', handleMouseMovePL);

      return () => {
          document.removeEventListener('pointerlockchange', handlePointerLockChange);
          document.removeEventListener('mousemove', handleMouseMovePL);
      };
  }, [cameraMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (keysPressed.current.hasOwnProperty(k)) keysPressed.current[k] = true;
      
      // Çizim veya Ölçümü ESC ile iptal et/tamamla
      if (e.key === 'Escape') {
          if (activeRouteRef.current && activeRouteRef.current.points.length > 1) {
              setRoutes(prev => [...prev, activeRouteRef.current]);
          }
          setActiveRoute(null);
          if (measuringPointRef.current) setMeasuringPoint(null);
          setCurrentTool(null);
          setSelectedCells([]);
      }
    };
    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (keysPressed.current.hasOwnProperty(k)) keysPressed.current[k] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId;
    let lastTime = performance.now();

    const loop = (time) => {
      const deltaTime = Math.min((time - lastTime) / 16.66, 3);
      lastTime = time;

      const is3DNow = is3DRef.current;
      const cameraModeNow = cameraModeRef.current;
      const camZoomNow = camZoomRef.current;

      if (is3DNow && cameraModeNow !== 'human') {
        let dx = 0; let dy = 0; let dz = 0;
        const speed = 10 * (1 / camZoomNow);
        
        // Kamera Kontrolleri (Fare ile tıklamaya gerek kalmadan her zaman çalışır)
        if (keysPressed.current.q) dy -= speed;  // İleri (Y ekseni) - eski W
        if (keysPressed.current.e) dy += speed;  // Geri (Y ekseni) - eski S
        if (keysPressed.current.d) dx -= speed; // Sola Kaydır (X ekseni) - eski A
        if (keysPressed.current.a) dx += speed; // Sağa Kaydır (X ekseni) - eski D
        if (keysPressed.current.s) dz += 0.05;  // Yaklaş / Yüksel (Zoom in) - eski E
        if (keysPressed.current.w) dz -= 0.05;  // Uzaklaş / Alçal (Zoom out) - eski Q

        if (dx !== 0 || dy !== 0) {
          const rad = camRotZRef.current * (Math.PI / 180);
          const moveX = dx * Math.cos(rad) - dy * Math.sin(rad);
          const moveY = dx * Math.sin(rad) + dy * Math.cos(rad);
          setCamPanX(prev => prev + moveX * deltaTime);
          setCamPanY(prev => prev + moveY * deltaTime);
        }
        if (dz !== 0) {
          setCamZoom(prev => Math.min(Math.max(0.05, prev + dz * deltaTime), 15));
        }
      } 
      
      if (cameraModeNow === 'human') {
          // İnsan Modu (FPS) Hareket Kontrolleri
          let dx = 0; let dy = 0;
          const speed = 6 * deltaTime; // Yürüme Hızı
          
          if (keysPressed.current.w) dy -= 1; // İleri
          if (keysPressed.current.s) dy += 1; // Geri
          if (keysPressed.current.a) dx -= 1; // Sola
          if (keysPressed.current.d) dx += 1; // Sağa

          let moving = (dx !== 0 || dy !== 0);
          if (moving !== isCharMovingRef.current) setIsCharMoving(moving);

          if (moving) {
              // Yürüme vektörünü normalize et (çapraz hızlanmayı önle)
              const len = Math.sqrt(dx*dx + dy*dy);
              dx = (dx / len) * speed;
              dy = (dy / len) * speed;

              // Kameranın baktığı açıya (Yaw) göre ilerleme hesapla
              const rad = charYawRef.current * (Math.PI / 180);
              const moveX = dx * Math.cos(rad) - dy * Math.sin(rad);
              const moveY = dx * Math.sin(rad) + dy * Math.cos(rad);

              let newX = charPosRef.current.x + moveX;
              let newY = charPosRef.current.y + moveY;

              // İnsan Modu Çarpışma ve Sınır Kontrolü
              const hit = (x, y) => {
                  const activeGrid = activeTabRef.current === 'market' ? marketGridRef.current : depotGridRef.current;
                  const cellPxNow = cellPxRef.current;
                  if (!activeGrid || activeGrid.length === 0) return true;
                  const cX = Math.floor(x / cellPxNow);
                  const cY = Math.floor(y / cellPxNow);
                  if(cX < 0 || cY < 0 || cX >= activeGrid[0].length || cY >= activeGrid.length) return true;
                  
                  const cell = activeGrid[cY][cX];
                  
                  // Kapı olan yerlerde serbestçe yürünebilir (Sıkışmayı önler)
                  if (cell.assigned === 'kapi') return false; 
                  
                  if (cell.base === 'removed') return true; // Boşluğa düşmeyi engelle

                  if(cell.assigned) {
                      const tool = toolsMap[cell.assigned];
                      // Zemin süsleri veya kapılar haricinde çarpış (Duvar, raf, tezgâh vb.)
                      if(tool?.type === 'object' && tool?.zHeightMeters > 0.2) {
                          return true; 
                      }
                  }
                  return false;
              };

              // Duvar kenarlarında kayarak ilerleme (Sliding)
              if (!hit(newX, newY)) setCharPos({ x: newX, y: newY });
              else if (!hit(charPosRef.current.x, newY)) setCharPos({ x: charPosRef.current.x, y: newY });
              else if (!hit(newX, charPosRef.current.y)) setCharPos({ x: newX, y: charPosRef.current.y });
          }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const changeCameraMode = (mode) => {
    setCameraMode(mode);
    setIs3D(true);
    if (mode === 'top') {
      setCamRotX(0); setCamRotZ(0); setCamPanX(0); setCamPanY(0); setCamZoom(1.1);
      if (document.pointerLockElement) document.exitPointerLock();
    } else if (mode === 'isometric') {
      setCamRotX(60); setCamRotZ(45);
      if (document.pointerLockElement) document.exitPointerLock();
    } else if (mode === 'human') {
      
      // Güvenli ve Gerçekçi Başlangıç Noktası Bul (Öncelik: Giriş Kapısı)
      let spawnX = (marketW * cellPx) / 2;
      let spawnY = (marketH * cellPx) / 2;
      const targetGrid = activeTab === 'market' ? marketGrid : depotGrid;
      let found = false;
      
      // Sadece Kapı varsa İnsan moduna izin ver
      for (let y = 0; y < targetGrid.length; y++) {
          for (let x = 0; x < targetGrid[0].length; x++) {
              if (targetGrid[y][x].assigned === 'kapi') {
                  spawnX = (x * cellPx) + (cellPx / 2);
                  spawnY = (y * cellPx) + (cellPx / 2); 
                  found = true; break;
              }
          }
          if (found) break;
      }
      
      if (!found) {
          showToast("İnsan moduna geçmek için önce zemin alanına bir 'Giriş Kapısı' yerleştirmelisiniz!");
          setCameraMode('isometric'); // Geçişi engelle
          return;
      }

      setCharPos({ x: spawnX, y: spawnY });
      setCharYaw(0);
      setCharPitch(90);
      
      // Fareyi ekrana kilitle ve FPS modunu başlat
      if (mainContainerRef.current) {
          mainContainerRef.current.requestPointerLock().catch(() => {});
      }
    }
  };

  function checkCollision(gridType, targetUid, newX, newY, newZ, newW, newH) {
    const targetGrid = gridType === 'market' ? marketGrid : depotGrid;
    const items = [];
    
    for (let r = 0; r < targetGrid.length; r++) {
      for (let c = 0; c < targetGrid[0].length; c++) {
        const cell = targetGrid[r][c];
        if (cell.assigned && cell.isRoot && cell.uid !== targetUid) {
           const objX = (c * cellSize) + (cell.offsetX || 0);
           const objY = (r * cellSize) + (cell.offsetY || 0);
           const objZ = cell.offsetZ || 0;
           const objW = cell.w * cellSize;
           const objH = cell.h * cellSize;
           const objZHeight = toolsMap[cell.assigned]?.zHeightMeters || 1;
           items.push({ uid: cell.uid, assigned: cell.assigned, left: objX, right: objX + objW, top: objY, bottom: objY + objH, zBase: objZ, zTop: objZ + objZHeight });
        }
      }
    }

    const tLeft = newX;
    const tRight = newX + (newW * cellSize);
    const tTop = newY;
    const tBottom = newY + (newH * cellSize);
    const tZBase = newZ;
    const tZTop = newZ + (toolsMap[targetGrid.find(row => row.some(c => c.uid === targetUid))?.find(c => c.uid === targetUid)?.assigned]?.zHeightMeters || 1);

    for (let item of items) {
       if (tLeft < item.right && tRight > item.left && tTop < item.bottom && tBottom > item.top) {
           if (tZBase < item.zTop && tZTop > item.zBase) {
               return { collision: true, collidedWith: item };
           }
       }
    }
    return { collision: false };
  }

  function triggerWarning(gridType, uids, message = "Çakışma! Eşyalar üst üste binemez.") {
    setGlobalWarning(true);
    setWarningMessage(message);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setGlobalWarning(false), 3000);

    const uidArray = Array.isArray(uids) ? uids : [uids];
    const setter = gridType === 'market' ? setMarketGrid : setDepotGrid;
    
    setter(prev => prev.map(row => row.map(cell => {
      if (uidArray.includes(cell.uid) && cell.isRoot) {
        return { ...cell, hasConflict: true };
      }
      return cell;
    })));
    
    setTimeout(() => {
      setter(prev => prev.map(row => row.map(cell => {
        if (uidArray.includes(cell.uid) && cell.isRoot) {
          return { ...cell, hasConflict: false };
        }
        return cell;
      })));
    }, 3000);
  }

  function checkZoneViolations(gridType, grid, uid) {
      for(let r=0; r<grid.length; r++) {
          for(let c=0; c<grid[0].length; c++) {
              if (grid[r][c].uid === uid && (grid[r][c].base === 'tahliyeYolu' || grid[r][c].base === 'gecisYolu')) {
                  triggerWarning(gridType, uid, "DİKKAT: Acil Tahliye veya Geçiş Yolu Kapatıldı!");
                  return;
              }
          }
      }

      const cellInfo = [];
      for(let r=0; r<grid.length; r++) {
          for(let c=0; c<grid[0].length; c++) {
              if (grid[r][c].uid === uid) cellInfo.push({x: c, y: r});
          }
      }
      if (cellInfo.length === 0) return;
      
      const bounds = {
          minX: Math.min(...cellInfo.map(c => c.x)) * cellSize,
          minY: Math.min(...cellInfo.map(c => c.y)) * cellSize,
          maxX: (Math.max(...cellInfo.map(c => c.x)) + 1) * cellSize,
          maxY: (Math.max(...cellInfo.map(c => c.y)) + 1) * cellSize,
      };

      const emergencyRoutes = routes.filter(r => r.gridType === gridType && r.type === 'tahliyeYolu');
      for (let route of emergencyRoutes) {
          for (let i=0; i<route.points.length - 1; i++) {
              const p1 = route.points[i];
              const p2 = route.points[i+1];
              const dist = Math.hypot(p2.realX-p1.realX, p2.realY-p1.realY);
              const steps = Math.ceil(dist / (cellSize/2));
              for (let j=0; j<=steps; j++) {
                  const px = p1.realX + (p2.realX-p1.realX)*(j/steps);
                  const py = p1.realY + (p2.realY-p1.realY)*(j/steps);
                  if (px >= bounds.minX && px <= bounds.maxX && py >= bounds.minY && py <= bounds.maxY) {
                      triggerWarning(gridType, uid, "DİKKAT: Acil Çıkış Güzergâhı Kapatıldı!");
                      return;
                  }
              }
          }
      }
  }

  const getNewItemData = (toolId) => {
    const count = (itemCounters.current[toolId] || 0) + 1;
    itemCounters.current[toolId] = count;
    const title = toolsMap[toolId]?.title || 'Obje';
    return { uid: `${toolId}_${Date.now()}_${count}`, name: `${title} ${count}` };
  };

  useEffect(() => {
    initGrids();
  }, [marketW, marketH, depotW, depotH, cellSize]);

  function initGrids() {
    const mCols = Math.ceil(marketW / cellSize);
    const mRows = Math.ceil(marketH / cellSize);
    const dCols = Math.ceil(depotW / cellSize);
    const dRows = Math.ceil(depotH / cellSize);

    const resizeGrid = (oldGrid, cols, rows, baseType) => {
        const newGrid = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                if (oldGrid[y] && oldGrid[y][x]) {
                    row.push(oldGrid[y][x]);
                } else {
                    row.push({ x, y, base: 'removed', assigned: null, rot: 0, w: 1, h: 1, isRoot: false, offsetX: 0, offsetY: 0, offsetZ: 0 });
                }
            }
            newGrid.push(row);
        }
        return newGrid;
    };

    if (isFirstLayout.current) {
        const newMarket = [];
        for (let y = 0; y < mRows; y++) {
          const row = [];
          for (let x = 0; x < mCols; x++) {
            row.push({ x, y, base: 'marketZemini', assigned: null, rot: 0, w: 1, h: 1, isRoot: false, offsetX: 0, offsetY: 0, offsetZ: 0 });
          }
          newMarket.push(row);
        }
        
        const newDepot = [];
        for (let y = 0; y < dRows; y++) {
          const row = [];
          for (let x = 0; x < dCols; x++) {
            row.push({ x, y, base: 'depoZemini', assigned: null, rot: 0, w: 1, h: 1, isRoot: false, offsetX: 0, offsetY: 0, offsetZ: 0 });
          }
          newDepot.push(row);
        }

        const prefill = (grid, sX, sY, id, w, h, r) => {
            const { uid, name } = getNewItemData(id);
            for(let y=sY; y<sY+h; y++) {
              for(let x=sX; x<sX+w; x++) {
                if(grid[y] && grid[y][x]) {
                  grid[y][x].assigned = id;
                  grid[y][x].w = w;
                  grid[y][x].h = h;
                  grid[y][x].rot = r;
                  grid[y][x].uid = uid;
                  grid[y][x].name = name;
                  grid[y][x].isRoot = (x === sX && y === sY);
                  grid[y][x].offsetX = 0;
                  grid[y][x].offsetY = 0;
                  grid[y][x].offsetZ = toolsMap[id]?.floatZMeters || 0;
                }
              }
            }
        };
          
        prefill(newMarket, 3, 3, 'reyon', 1, 4, 0);
        prefill(newMarket, 7, 3, 'reyon', 1, 4, 0);
        prefill(newMarket, 11, 3, 'kasap', 1, 3, 0);
        prefill(newMarket, 3, 10, 'manav', 2, 2, 0);
        prefill(newMarket, 8, 10, 'manav', 2, 2, 0);
        prefill(newMarket, 14, 12, 'kasa', 2, 2, 0);
        prefill(newMarket, 14, 9, 'personel', 1, 1, 180);
        prefill(newMarket, 18, 10, 'kapi', 1, 2, 0); 
        prefill(newMarket, 17, 13, 'turnike', 1, 1, 90); 
        prefill(newMarket, 12, 7, 'masa', 2, 1, 0); 
        prefill(newMarket, 4, 6, 'tepeLambasi', 1, 1, 0); 

        prefill(newDepot, 2, 2, 'depoRaf', 1, 4, 0);
        prefill(newDepot, 5, 2, 'depoRaf', 1, 4, 0);
        prefill(newDepot, 3, 7, 'palet', 2, 2, 0);
        prefill(newDepot, 7, 7, 'koli', 1, 1, 0);

        for(let y=15; y<19; y++) {
            for(let x=10; x<12; x++) {
              if(newMarket[y] && newMarket[y][x]) newMarket[y][x].base = 'tahliyeYolu';
            }
        }

        isFirstLayout.current = false;
        setMarketGrid(newMarket);
        setDepotGrid(newDepot);
    } else {
        let mGrid = resizeGrid(marketGrid, mCols, mRows, 'marketZemini');
        let dGrid = resizeGrid(depotGrid, dCols, dRows, 'depoZemini');
        
        if (pendingPaintRef.current) {
            const { gridType, x, y, baseType } = pendingPaintRef.current;
            if (gridType === 'market' && mGrid[y] && mGrid[y][x]) {
                mGrid[y][x] = { ...mGrid[y][x], base: baseType };
            } else if (gridType === 'depot' && dGrid[y] && dGrid[y][x]) {
                dGrid[y][x] = { ...dGrid[y][x], base: baseType };
            }
            pendingPaintRef.current = null;
        }

        setMarketGrid(mGrid);
        setDepotGrid(dGrid);
    }
  }

  function onPointerDownCell(e, gridType, x, y) {
    if (e.button !== 0) return; 
    e.stopPropagation();
    
    if (currentTool === 'olcumMesafe') {
        const point = { gridType, x, y, realX: x * cellSize, realY: y * cellSize };
        if (!measuringPoint) {
            setMeasuringPoint(point);
            showToast("İlk nokta seçildi. Farenizi hareket ettirerek mesafeyi görebilirsiniz.");
        } else {
            if (measuringPoint.gridType !== gridType) {
                showToast("Ölçüm aynı alan (Market/Depo) içinde olmalıdır.");
                setMeasuringPoint(null);
                return;
            }
            const dist = Math.sqrt(Math.pow(point.realX - measuringPoint.realX, 2) + Math.pow(point.realY - measuringPoint.realY, 2));
            setMeasurements(prev => [...prev, { p1: measuringPoint, p2: point, distance: dist, id: Date.now() }]);
            setMeasuringPoint(null);
        }
        return;
    }

    if (toolsMap[currentTool]?.type === 'route') {
        let point = { gridType, x, y, realX: x * cellSize + (cellSize/2), realY: y * cellSize + (cellSize/2) };
        if (!activeRoute) {
            setActiveRoute({ id: Date.now(), type: currentTool, gridType, points: [point] });
            showToast("Güzergâh çizimi başladı. Devam etmek için tıklayın.");
        } else {
            if (activeRoute.gridType !== gridType) {
                showToast("Farklı alana güzergâh çizilemez!");
                return;
            }
            
            // Çapraz Tıklama (L Şeklinde Dönüş)
            const lastPoint = activeRoute.points[activeRoute.points.length - 1];
            if (point.realX !== lastPoint.realX && point.realY !== lastPoint.realY) {
                // Çapraz -> Köşe noktası oluştur
                const cornerPoint = { ...point, realX: point.realX, realY: lastPoint.realY };
                setActiveRoute(prev => ({ ...prev, points: [...prev.points, cornerPoint, point] }));
            } else if (point.realX !== lastPoint.realX || point.realY !== lastPoint.realY) {
                setActiveRoute(prev => ({ ...prev, points: [...prev.points, point] }));
            }
        }
        return;
    }

    const targetGrid = gridType === 'market' ? marketGrid : depotGrid;
    const cell = targetGrid[y][x];

    if (e.ctrlKey || e.metaKey) {
      dragSource.current = {
        type: 'boxSelect',
        gridType,
        startX: x,
        startY: y,
        currX: x,
        currY: y,
        initialSelection: [...selectedCells]
      };
      selectItemsInBox(gridType, x, y, x, y, [...selectedCells]);
      return;
    }

    if (cell.assigned) {
      let newSelection = [...selectedCells];
      
      if (!selectedCells.some(s => s.uid === cell.uid)) {
        newSelection = [];
        for (let r = 0; r < targetGrid.length; r++) {
          for (let c = 0; c < targetGrid[0].length; c++) {
            if (targetGrid[r][c].uid === cell.uid) {
              newSelection.push({ gridType, x: c, y: r, data: targetGrid[r][c], uid: cell.uid });
            }
          }
        }
      }
      
      setSelectedCells(newSelection);
      if (newSelection.length > 0 && !newSelection.find(s => s.uid === expandedInspectorId)) {
        setExpandedInspectorId(newSelection[newSelection.length - 1].uid);
      }
      
      dragSource.current = { type: 'move', gridType, originX: x, originY: y, currX: x, currY: y, selectionSnapshot: newSelection };
    } else {
      setSelectedCells([]); 
      if (currentTool) {
        handleCellAction(gridType, x, y);
      }
    }
  }

  function onPointerEnterCell(e, gridType, x, y) {
    setHoveredArea({ gridType, x, y });

    if (dragSource.current && dragSource.current.type === 'boxSelect') {
      if (e.buttons !== 1) { dragSource.current = null; return; }
      selectItemsInBox(dragSource.current.gridType, dragSource.current.startX, dragSource.current.startY, x, y, dragSource.current.initialSelection);
      return;
    }

    if (dragSource.current && dragSource.current.type === 'move' && dragSource.current.gridType === gridType) {
      if (e.buttons !== 1) {
        dragSource.current = null;
        return;
      }
      
      const source = dragSource.current;
      const dx = x - source.currX;
      const dy = y - source.currY;
      
      if (dx === 0 && dy === 0) return;

      const targetGrid = gridType === 'market' ? [...marketGrid] : [...depotGrid];
      const rows = targetGrid.length;
      const cols = targetGrid[0].length;
      
      let canMove = true;
      for (let s of source.selectionSnapshot) {
        const nx = s.x + dx;
        const ny = s.y + dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) { canMove = false; break; }
        
        const targetCell = targetGrid[ny][nx];
        const isTargetInSelection = source.selectionSnapshot.some(sel => sel.x === nx && sel.y === ny);
        if (targetCell.assigned && !isTargetInSelection) {
            const movingTool = toolsMap[s.data.assigned];
            if (movingTool?.stackOn?.includes(targetCell.assigned)) {
                // İzin ver
            } else {
                canMove = false; break;
            }
        }
      }

      if (canMove) {
        const newGrid = JSON.parse(JSON.stringify(targetGrid)); 
        
        for (let s of source.selectionSnapshot) {
          newGrid[s.y][s.x].assigned = null;
          newGrid[s.y][s.x].uid = null;
          newGrid[s.y][s.x].name = null;
          newGrid[s.y][s.x].isRoot = false;
        }
        
        let newSelection = [];
        for (let s of source.selectionSnapshot) {
          const nx = s.x + dx;
          const ny = s.y + dy;
          const targetCell = targetGrid[ny][nx];
          
          let newOffsetZ = s.data.offsetZ || 0;
          if (targetCell.assigned && toolsMap[s.data.assigned]?.stackOn?.includes(targetCell.assigned)) {
              newOffsetZ = (targetCell.offsetZ || 0) + (toolsMap[targetCell.assigned]?.zHeightMeters || 1);
          }

          newGrid[ny][nx] = { ...newGrid[ny][nx], assigned: s.data.assigned, rot: s.data.rot, w: s.data.w, h: s.data.h, uid: s.data.uid, name: s.data.name, isRoot: s.data.isRoot, offsetX: s.data.offsetX, offsetY: s.data.offsetY, offsetZ: newOffsetZ };
          newSelection.push({ gridType, x: nx, y: ny, data: newGrid[ny][nx], uid: s.data.uid });
        }
        
        source.currX = x;
        source.currY = y;
        source.selectionSnapshot = newSelection;
        
        updateGridState(gridType, newGrid);
        setSelectedCells(newSelection);
        
        checkZoneViolations(gridType, newGrid, newSelection[0].uid);
      } else {
        if (!source.lastWarning || Date.now() - source.lastWarning > 2000) {
            triggerWarning(gridType, source.selectionSnapshot[0].uid, "Geçersiz Konum veya Üst Üste Koyma Hatası!");
            source.lastWarning = Date.now();
        }
      }
    } else if (e.buttons === 1) { 
      const tool = toolsMap[currentTool];
      if (tool && (tool.type === 'base' || tool.type === 'eraser_base')) {
        handleCellAction(gridType, x, y);
      }
    }
  }

  function selectItemsInBox(gridType, startX, startY, endX, endY, baseSelection) {
    const targetGrid = gridType === 'market' ? marketGrid : depotGrid;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    let newSelection = [...baseSelection];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const cell = targetGrid[y]?.[x];
        if (cell && cell.assigned && cell.uid) {
          if (!newSelection.some(s => s.uid === cell.uid)) {
            for (let r = 0; r < targetGrid.length; r++) {
              for (let c = 0; c < targetGrid[0].length; c++) {
                if (targetGrid[r][c].uid === cell.uid) {
                  newSelection.push({ gridType, x: c, y: r, data: targetGrid[r][c], uid: cell.uid });
                }
              }
            }
          }
        }
      }
    }
    setSelectedCells(newSelection);
    if (newSelection.length > 0 && !newSelection.find(s => s.uid === expandedInspectorId)) {
      setExpandedInspectorId(newSelection[newSelection.length - 1].uid);
    }
  }

  function handleCellAction(gridType, startX, startY) {
    const tool = toolsMap[currentTool];
    if (!tool) return;

    const targetGrid = gridType === 'market' ? [...marketGrid] : [...depotGrid];
    const rows = targetGrid.length;
    const cols = targetGrid[0].length;
    const startCell = targetGrid[startY]?.[startX];
    if (!startCell) return;

    if (tool.type === 'eraser_base') {
      const targetUid = startCell.uid;
      if (targetUid) {
        for (let r = 0; r < rows; r++) {
          let rowCloned = false;
          for (let c = 0; c < cols; c++) {
            if (targetGrid[r][c].uid === targetUid) {
              if (!rowCloned) {
                targetGrid[r] = [...targetGrid[r]];
                rowCloned = true;
              }
              targetGrid[r][c] = { ...targetGrid[r][c], assigned: null, uid: null, name: null, isRoot: false, offsetX: 0, offsetY: 0, offsetZ: 0 };
            }
          }
        }
        if (selectedCells.some(s => s.gridType === gridType && s.uid === targetUid)) {
          setSelectedCells(prev => prev.filter(s => s.uid !== targetUid));
        }
      }
      targetGrid[startY] = [...targetGrid[startY]];
      targetGrid[startY][startX] = { ...targetGrid[startY][startX], base: 'removed', assigned: null };
      updateGridState(gridType, targetGrid);
      return;
    }

    let bW = 1;
    let bH = 1;
    if (tool.type === 'base' || tool.type === 'object' || tool.type === 'figure') {
      bW = tool.defW || brushW || 1;
      bH = tool.defH || brushH || 1;
      if (brushRot % 180 !== 0) [bW, bH] = [bH, bW];
    }
    const { uid, name } = getNewItemData(tool.id);

    for (let y = startY; y < Math.min(startY + bH, rows); y++) {
      targetGrid[y] = [...targetGrid[y]];
      for (let x = startX; x < Math.min(startX + bW, cols); x++) {
        let cell = targetGrid[y][x];
        if (tool.type === 'base') {
          targetGrid[y][x] = { ...cell, base: tool.id };
        } else {
          targetGrid[y][x] = {
            ...cell,
            base: cell.base === 'removed' ? 'marketZemini' : cell.base,
            assigned: tool.id,
            rot: brushRot,
            w: bW,
            h: bH,
            isOval: !!tool.isOval,
            uid: uid,
            name: name,
            isRoot: (x === startX && y === startY),
            offsetX: 0,
            offsetY: 0,
            offsetZ: tool.floatZMeters || 0
          };
        }
      }
    }
    updateGridState(gridType, targetGrid);
  }

  function deleteSelectedObjects(targetUid = null) {
      const uids = targetUid ? [targetUid] : [...new Set(selectedCells.map(s => s.uid))];
      let mGrid = [...marketGrid];
      let dGrid = [...depotGrid];
      let updated = false;

      uids.forEach(uid => {
          for (let r = 0; r < mGrid.length; r++) {
              for (let c = 0; c < mGrid[0].length; c++) {
                  if (mGrid[r][c].uid === uid) {
                      mGrid[r][c] = { ...mGrid[r][c], assigned: null, uid: null, name: null, isRoot: false, hasConflict: false, offsetX: 0, offsetY: 0, offsetZ: 0 };
                      updated = true;
                  }
              }
          }
          for (let r = 0; r < dGrid.length; r++) {
              for (let c = 0; c < dGrid[0].length; c++) {
                  if (dGrid[r][c].uid === uid) {
                      dGrid[r][c] = { ...dGrid[r][c], assigned: null, uid: null, name: null, isRoot: false, hasConflict: false, offsetX: 0, offsetY: 0, offsetZ: 0 };
                      updated = true;
                  }
              }
          }
      });

      if (updated) {
          setMarketGrid(mGrid);
          setDepotGrid(dGrid);
          if (targetUid) {
              setSelectedCells(prev => prev.filter(s => s.uid !== targetUid));
          } else {
              setSelectedCells([]);
          }
      }
  }

  function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl z-[999] font-medium tracking-wide transition-opacity duration-500';
      toast.innerHTML = msg;
      document.body.appendChild(toast);
      setTimeout(() => { toast.remove(); }, 3000);
  }

  function updatePrecisionCoordinate(uid, axis, valueStr) {
      const val = parseFloat(valueStr);
      if (isNaN(val)) return;

      const targetCells = selectedCells.filter(s => s.uid === uid);
      if (targetCells.length === 0) return;
      
      const { gridType } = targetCells[0];
      const targetGrid = gridType === 'market' ? [...marketGrid] : [...depotGrid];
      const rows = targetGrid.length;
      const cols = targetGrid[0].length;

      let rootInfo = targetCells.find(c => c.data.isRoot);
      if (!rootInfo) return;

      const newGridX = axis === 'x' ? Math.floor(val / cellSize) : rootInfo.x;
      const newGridY = axis === 'y' ? Math.floor(val / cellSize) : rootInfo.y;
      const newOffsetX = axis === 'x' ? val - (newGridX * cellSize) : rootInfo.data.offsetX;
      const newOffsetY = axis === 'y' ? val - (newGridY * cellSize) : rootInfo.data.offsetY;
      const newOffsetZ = axis === 'z' ? val : rootInfo.data.offsetZ;
      const rot = axis === 'rot' ? val : rootInfo.data.rot;

      const realX = axis === 'x' ? val : (rootInfo.x * cellSize) + (rootInfo.data.offsetX || 0);
      const realY = axis === 'y' ? val : (rootInfo.y * cellSize) + (rootInfo.data.offsetY || 0);

      const collisionCheck = checkCollision(gridType, uid, realX, realY, newOffsetZ, rootInfo.data.w, rootInfo.data.h);
      if (collisionCheck.collision) {
          triggerWarning(gridType, uid, `HATA: "${toolsMap[collisionCheck.collidedWith.assigned]?.title}" ile çarpışıyor!`);
          return; 
      }

      if (newGridX < 0 || newGridX + rootInfo.data.w > cols || newGridY < 0 || newGridY + rootInfo.data.h > rows) {
          triggerWarning(gridType, uid, "Alan dışına çıkılamaz!");
          return;
      }

      for (let s of targetCells) {
          targetGrid[s.y][s.x] = { ...targetGrid[s.y][s.x], assigned: null, uid: null, name: null, isRoot: false, offsetX: 0, offsetY: 0, offsetZ: 0 };
      }

      let newSelection = [];
      for (let y = newGridY; y < newGridY + rootInfo.data.h; y++) {
          for (let x = newGridX; x < newGridX + rootInfo.data.w; x++) {
              targetGrid[y][x] = { 
                  ...targetGrid[y][x], 
                  assigned: rootInfo.data.assigned, 
                  rot: rot, 
                  w: rootInfo.data.w, 
                  h: rootInfo.data.h, 
                  uid, 
                  name: rootInfo.data.name,
                  isRoot: (x === newGridX && y === newGridY),
                  offsetX: newOffsetX,
                  offsetY: newOffsetY,
                  offsetZ: newOffsetZ
              };
              newSelection.push({ gridType, x, y, data: targetGrid[y][x], uid });
          }
      }

      updateGridState(gridType, targetGrid);
      const filteredSelection = selectedCells.filter(s => s.uid !== uid);
      setSelectedCells([...filteredSelection, ...newSelection]);
      checkZoneViolations(gridType, targetGrid, uid);
  }

  // Boşluk tıklama yönetimi ve kamera hareket başlangıcı
  function handleMouseDown(e) {
    // UI Dışı Tıklamalarda Seçim ve Araçları İptal Etme
    if (e.button === 0 && !e.target.closest('.pointer-events-auto') && !e.target.closest('.ui-panel')) {
        setCurrentTool(null);
        setSelectedCells([]);
        setActiveRoute(null);
        setMeasuringPoint(null);
        setIsRulerMenuOpen(false);
    }

    if (cameraMode === 'human') {
        // İnsan modunda boşluğa tıklandığında kilit düştüyse tekrar kilitle
        if (mainContainerRef.current && document.pointerLockElement !== mainContainerRef.current) {
            mainContainerRef.current.requestPointerLock().catch(() => {});
        }
        return; // Normal sürüklemeyi iptal et
    } else if (e.button === 2 || e.button === 1) { 
      isDraggingCam.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY, button: e.button };
    }
  }

  function handleMouseMove(e) {
    if (cameraMode === 'human') return; // İnsan modu kontrolleri pointerLockChange'e devredildi

    if (isDraggingCam.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      
      if (is3D && lastMouse.current.button === 2 && !e.shiftKey) {
          setCamRotZ(prev => prev - dx * 0.5); 
          setCamRotX(prev => Math.max(0, Math.min(85, prev - dy * 0.5)));
      } else {
          setCamPanX(prev => prev + dx);
          setCamPanY(prev => prev + dy);
      }
      lastMouse.current = { x: e.clientX, y: e.clientY, button: lastMouse.current.button };
    }
  }

  function handleMouseUp() {
    isDraggingCam.current = false;
    dragSource.current = null; 
  }

  function handleWheel(e) {
    e.preventDefault();
    setCamZoom(prev => Math.min(Math.max(0.05, prev + e.deltaY * -0.001), 15));
  }

  const handleExpandGrid = (gridType, x, y) => {
      const isMarket = gridType === 'market';
      const cols = isMarket ? Math.ceil(marketW / cellSize) : Math.ceil(depotW / cellSize);
      const rows = isMarket ? Math.ceil(marketH / cellSize) : Math.ceil(depotH / cellSize);
      
      if (x >= cols || y >= rows) {
          // Alan dışına genişleme
          pendingPaintRef.current = { gridType, x, y, baseType: isMarket ? 'marketZemini' : 'depoZemini' };
          if (x >= cols) { isMarket ? setMarketW(prev => prev + cellSize) : setDepotW(prev => prev + cellSize); }
          if (y >= rows) { isMarket ? setMarketH(prev => prev + cellSize) : setDepotH(prev => prev + cellSize); }
      } else {
          // Izgara içi genişleme (Anında Boyama)
          const targetGrid = isMarket ? [...marketGrid] : [...depotGrid];
          targetGrid[y] = [...targetGrid[y]];
          targetGrid[y][x] = { ...targetGrid[y][x], base: isMarket ? 'marketZemini' : 'depoZemini' };
          updateGridState(gridType, targetGrid);
      }
  };

  const renderGhostCells = (gridType) => {
      const isDrawingBase = toolsMap[currentTool]?.type === 'base';
      if (!isDrawingBase) return null;
      if ((gridType === 'market' && currentTool !== 'marketZemini') || (gridType === 'depot' && currentTool !== 'depoZemini')) return null;

      const grid = gridType === 'market' ? marketGrid : depotGrid;
      if (grid.length === 0) return null;
      const rows = grid.length;
      const cols = grid[0].length;
      
      const ghosts = new Set();
      const addGhost = (x, y) => {
          if (x >= 0 && y >= 0) ghosts.add(`${x},${y}`);
      };

      for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
              if (grid[y][x].base !== 'removed') {
                  // Mevcut zeminlerin etrafındaki boşlukları bul (Wrap-around)
                  if (y > 0 && grid[y-1][x].base === 'removed') addGhost(x, y-1);
                  if (y < rows - 1 && grid[y+1][x].base === 'removed') addGhost(x, y+1);
                  if (x > 0 && grid[y][x-1].base === 'removed') addGhost(x-1, y);
                  if (x < cols - 1 && grid[y][x+1].base === 'removed') addGhost(x+1, y);
                  
                  // Kenar dışı genişleme noktaları
                  if (y === rows - 1) addGhost(x, rows);
                  if (x === cols - 1) addGhost(cols, y);
              }
          }
      }
      
      // Eğere ızgara tamamen boşsa
      let isGridEmpty = true;
      for (let y = 0; y < rows; y++) {
          if (grid[y].some(c => c.base !== 'removed')) {
              isGridEmpty = false; break;
          }
      }
      if (isGridEmpty) {
          addGhost(0, 0);
      }

      return Array.from(ghosts).map(g => {
          const [x, y] = g.split(',').map(Number);
          return (
              <div 
                  key={`ghost-${x}-${y}`}
                  className="absolute bg-white/10 border border-white/20 border-dashed cursor-pointer hover:bg-white/30 hover:border-white/60 transition-colors z-[100] flex items-center justify-center backdrop-blur-sm pointer-events-auto"
                  style={{
                      width: `${cellPx}px`, height: `${cellPx}px`,
                      left: `${x * cellPx}px`, top: `${y * cellPx}px`,
                      transform: 'translateZ(1px)'
                  }}
                  onClick={(e) => { e.stopPropagation(); handleExpandGrid(gridType, x, y); }}
              >
                  <span className="text-white opacity-80 font-black text-xl drop-shadow-md">+</span>
              </div>
          );
      });
  };

  const formatDist = (meters) => {
      if (measurementUnit === 'cm') return (meters * 100).toFixed(0) + ' cm';
      return meters.toFixed(2) + ' m';
  };

  const renderMeasurements = (gridType) => {
      const validM = measurements.filter(m => m.p1.gridType === gridType && m.p2.gridType === gridType);
      const gridRoutes = routes.filter(r => r.gridType === gridType);
      
      return (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-visible" style={{ width: '100%', height: '100%', transform: 'translateZ(3px)', transformStyle: 'preserve-3d' }}>
              <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: '100%', height: '100%' }}>
                  <defs>
                      <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.5" markerHeight="2.5" orient="auto-start-reverse">
                          <path d="M 1 1 L 9 5 L 1 9 z" fill="#ef4444" />
                      </marker>
                      <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.5" markerHeight="2.5" orient="auto-start-reverse">
                          <path d="M 1 1 L 9 5 L 1 9 z" fill="#22c55e" />
                      </marker>
                  </defs>
                  
                  {/* BİTMİŞ GÜZERGÂHLAR */}
                  {gridRoutes.map(r => {
                      const isRed = r.type === 'tahliyeYolu';
                      const strokeC = isRed ? '#ef4444' : '#22c55e';
                      const marker = isRed ? 'url(#arrowRed)' : 'url(#arrowGreen)';
                      const pts = r.points.map(p => `${(p.realX/cellSize)*cellPx},${(p.realY/cellSize)*cellPx}`).join(' ');
                      
                      return (
                          <g key={r.id}>
                              <polyline points={pts} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points={pts} fill="none" stroke={strokeC} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={isRed ? '16,16' : 'none'} opacity="0.85" markerMid={marker} markerEnd={marker} />
                          </g>
                      );
                  })}

                  {/* AKTİF GÜZERGÂH ÇİZİMİ */}
                  {activeRoute && activeRoute.gridType === gridType && (() => {
                      const isRed = activeRoute.type === 'tahliyeYolu';
                      const strokeC = isRed ? '#ef4444' : '#22c55e';
                      const marker = isRed ? 'url(#arrowRed)' : 'url(#arrowGreen)';
                      
                      let nextPoint = hoveredArea.gridType === gridType ? {realX: hoveredArea.x*cellSize + cellSize/2, realY: hoveredArea.y*cellSize + cellSize/2} : activeRoute.points[activeRoute.points.length-1];
                      
                      let previewPoints = [...activeRoute.points];
                      
                      // L-Şeklinde Önizleme (Çapraz Giderken Köşe Gösterimi)
                      if (hoveredArea.gridType === gridType && activeRoute.points.length > 0) {
                           const lastPoint = activeRoute.points[activeRoute.points.length - 1];
                           if (nextPoint.realX !== lastPoint.realX && nextPoint.realY !== lastPoint.realY) {
                               previewPoints.push({ realX: nextPoint.realX, realY: lastPoint.realY });
                           }
                      }
                      
                      previewPoints.push(nextPoint);
                      const pts = previewPoints.map(p => `${(p.realX/cellSize)*cellPx},${(p.realY/cellSize)*cellPx}`).join(' ');

                      return (
                          <g>
                              <polyline points={pts} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                              <polyline points={pts} fill="none" stroke={strokeC} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={isRed ? '16,16' : 'none'} opacity="0.75" markerMid={marker} markerEnd={marker} />
                          </g>
                      );
                  })()}
                  
                  {/* BİTMİŞ ÖLÇÜMLER */}
                  {validM.map(m => {
                      const x1 = (m.p1.realX / cellSize) * cellPx + (cellPx/2);
                      const y1 = (m.p1.realY / cellSize) * cellPx + (cellPx/2);
                      const x2 = (m.p2.realX / cellSize) * cellPx + (cellPx/2);
                      const y2 = (m.p2.realY / cellSize) * cellPx + (cellPx/2);
                      const midX = (x1 + x2) / 2;
                      const midY = (y1 + y2) / 2;

                      return (
                          <g key={m.id}>
                              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#eab308" strokeWidth="4" strokeDasharray="6,4" />
                              {!is3D && <circle cx={x1} cy={y1} r="6" fill="#020617" />}
                              {!is3D && <circle cx={x2} cy={y2} r="6" fill="#020617" />}
                              <rect x={midX - 35} y={midY - 12} width="70" height="24" rx="4" fill="#1e293b" stroke="#eab308" />
                              <text x={midX} y={midY + 4} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">{formatDist(m.distance)}</text>
                          </g>
                      )
                  })}

                  {/* AKTİF ÖLÇÜM (Çizerken) */}
                  {currentTool === 'olcumMesafe' && measuringPoint && measuringPoint.gridType === gridType && hoveredArea.gridType === gridType && (
                      <g>
                          {(() => {
                              const x1 = (measuringPoint.realX / cellSize) * cellPx + (cellPx/2);
                              const y1 = (measuringPoint.realY / cellSize) * cellPx + (cellPx/2);
                              const x2 = hoveredArea.x * cellPx + (cellPx/2);
                              const y2 = hoveredArea.y * cellPx + (cellPx/2);
                              const midX = (x1 + x2) / 2;
                              const midY = (y1 + y2) / 2;
                              const currentDist = Math.sqrt(Math.pow((hoveredArea.x*cellSize) - measuringPoint.realX, 2) + Math.pow((hoveredArea.y*cellSize) - measuringPoint.realY, 2));

                              return (
                                  <>
                                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#eab308" strokeWidth="4" strokeDasharray="6,4" opacity="0.8" />
                                      {!is3D && <circle cx={x1} cy={y1} r="6" fill="#020617" />}
                                      {!is3D && <circle cx={x2} cy={y2} r="6" fill="#020617" opacity="0.6" />}
                                      <rect x={midX - 35} y={midY - 12} width="70" height="24" rx="4" fill="#1e293b" stroke="#eab308" opacity="0.8" />
                                      <text x={midX} y={midY + 4} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.9">{formatDist(currentDist)}</text>
                                  </>
                              );
                          })()}
                      </g>
                  )}
              </svg>

              {/* 3D Modu Siyah Ölçüm Direkleri */}
              {is3D && validM.map(m => {
                  const x1 = (m.p1.realX / cellSize) * cellPx + (cellPx/2);
                  const y1 = (m.p1.realY / cellSize) * cellPx + (cellPx/2);
                  const x2 = (m.p2.realX / cellSize) * cellPx + (cellPx/2);
                  const y2 = (m.p2.realY / cellSize) * cellPx + (cellPx/2);
                  return (
                      <React.Fragment key={`pole-${m.id}`}>
                          <div className="absolute bg-[#020617] border border-[#1e293b] rounded-t-full shadow-[0_5px_15px_rgba(0,0,0,0.8)]" style={{ left: x1 - 3, top: y1 - 100, width: 6, height: 100, transformOrigin: 'bottom center', transform: 'rotateX(-90deg)' }}></div>
                          <div className="absolute bg-[#020617] border border-[#1e293b] rounded-t-full shadow-[0_5px_15px_rgba(0,0,0,0.8)]" style={{ left: x2 - 3, top: y2 - 100, width: 6, height: 100, transformOrigin: 'bottom center', transform: 'rotateX(-90deg)' }}></div>
                      </React.Fragment>
                  );
              })}

              {is3D && currentTool === 'olcumMesafe' && measuringPoint && measuringPoint.gridType === gridType && hoveredArea.gridType === gridType && (() => {
                  const x1 = (measuringPoint.realX / cellSize) * cellPx + (cellPx/2);
                  const y1 = (measuringPoint.realY / cellSize) * cellPx + (cellPx/2);
                  const x2 = hoveredArea.x * cellPx + (cellPx/2);
                  const y2 = hoveredArea.y * cellPx + (cellPx/2);
                  return (
                      <React.Fragment>
                          <div className="absolute bg-[#020617] border border-[#1e293b] rounded-t-full shadow-[0_5px_15px_rgba(0,0,0,0.8)]" style={{ left: x1 - 3, top: y1 - 100, width: 6, height: 100, transformOrigin: 'bottom center', transform: 'rotateX(-90deg)' }}></div>
                          <div className="absolute bg-[#020617] border border-[#1e293b] rounded-t-full shadow-[0_5px_15px_rgba(0,0,0,0.8)] opacity-60" style={{ left: x2 - 3, top: y2 - 100, width: 6, height: 100, transformOrigin: 'bottom center', transform: 'rotateX(-90deg)' }}></div>
                      </React.Fragment>
                  );
              })()}
          </div>
      )
  };

  const renderRealisticModel = (toolId, isSelected, zHeightPx, hasConflict) => {
      const zNum = parseFloat(zHeightPx) || 50;
      const conflictClass = hasConflict ? 'ring-4 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : '';
      
      const Box = ({ left='0', top='0', w='100%', h='100%', z='0px', d='50px', c='#e2e8f0', isOval=false }) => (
          <div className="absolute" style={{ left, top, width: w, height: h, transform: `translateZ(${z})`, transformStyle: 'preserve-3d' }}>
             <div className={`absolute inset-0 ${conflictClass}`} style={{ backgroundColor: c, border: isSelected?'2px solid #facc15':'1px solid rgba(0,0,0,0.25)', borderRadius: isOval?'50%':'0', transform: `translateZ(${d})`, boxShadow: isSelected ? 'inset 0 0 12px rgba(250,204,21,0.6)' : 'inset 0 0 10px rgba(0,0,0,0.1)' }}></div>
             <div className="absolute bottom-0 left-0 w-full" style={{ backgroundColor: c, border: isSelected?'2px solid #facc15':'1px solid rgba(0,0,0,0.25)', height: d, transformOrigin: 'bottom', transform: 'rotateX(-90deg)', filter: 'brightness(0.85)' }}></div>
             <div className="absolute top-0 left-0 w-full" style={{ backgroundColor: c, border: isSelected?'2px solid #facc15':'1px solid rgba(0,0,0,0.25)', height: d, transformOrigin: 'top', transform: 'rotateX(90deg)', filter: 'brightness(0.7)' }}></div>
             <div className="absolute top-0 left-0 h-full" style={{ backgroundColor: c, border: isSelected?'2px solid #facc15':'1px solid rgba(0,0,0,0.25)', width: d, transformOrigin: 'left', transform: 'rotateY(-90deg)', filter: 'brightness(0.9)' }}></div>
             <div className="absolute top-0 right-0 h-full" style={{ backgroundColor: c, border: isSelected?'2px solid #facc15':'1px solid rgba(0,0,0,0.25)', width: d, transformOrigin: 'right', transform: 'rotateY(90deg)', filter: 'brightness(0.6)' }}></div>
          </div>
      );

      if (toolId === 'masa') {
          return (
              <>
                 <Box left="10%" top="10%" w="10%" h="10%" z="0px" d={`${zNum - 4}px`} c="#fcd34d" isSelected={isSelected} />
                 <Box left="80%" top="10%" w="10%" h="10%" z="0px" d={`${zNum - 4}px`} c="#fcd34d" isSelected={isSelected} />
                 <Box left="10%" top="80%" w="10%" h="10%" z="0px" d={`${zNum - 4}px`} c="#fcd34d" isSelected={isSelected} />
                 <Box left="80%" top="80%" w="10%" h="10%" z="0px" d={`${zNum - 4}px`} c="#fcd34d" isSelected={isSelected} />
                 <Box left="0" top="0" w="100%" h="100%" z={`${zNum - 4}px`} d="4px" c="#fbbf24" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'reyon') {
          return (
              <>
                 <Box left="0" top="45%" w="100%" h="10%" z="0px" d={`${zNum}px`} c="#475569" isSelected={isSelected} />
                 <Box left="0" top="0" w="100%" h="100%" z="0px" d="4px" c="#cbd5e1" isSelected={isSelected} />
                 <Box left="0" top="10%" w="100%" h="80%" z={`${zNum * 0.33}px`} d="4px" c="#e2e8f0" isSelected={isSelected} />
                 <Box left="0" top="15%" w="100%" h="70%" z={`${zNum * 0.66}px`} d="4px" c="#e2e8f0" isSelected={isSelected} />
                 <Box left="0" top="20%" w="100%" h="60%" z={`${zNum - 4}px`} d="4px" c="#f8fafc" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'depoRaf') {
          return (
              <>
                 <Box left="0" top="0" w="10%" h="10%" z="0px" d={`${zNum}px`} c="#4f46e5" isSelected={isSelected} />
                 <Box left="90%" top="0" w="10%" h="10%" z="0px" d={`${zNum}px`} c="#4f46e5" isSelected={isSelected} />
                 <Box left="0" top="90%" w="10%" h="10%" z="0px" d={`${zNum}px`} c="#4f46e5" isSelected={isSelected} />
                 <Box left="90%" top="90%" w="10%" h="10%" z="0px" d={`${zNum}px`} c="#4f46e5" isSelected={isSelected} />
                 <Box left="0" top="0" w="100%" h="100%" z={`${zNum * 0.25}px`} d="3px" c="#818cf8" isSelected={isSelected} />
                 <Box left="0" top="0" w="100%" h="100%" z={`${zNum * 0.5}px`} d="3px" c="#818cf8" isSelected={isSelected} />
                 <Box left="0" top="0" w="100%" h="100%" z={`${zNum * 0.75}px`} d="3px" c="#818cf8" isSelected={isSelected} />
                 <Box left="0" top="0" w="100%" h="100%" z={`${zNum - 3}px`} d="3px" c="#818cf8" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'manav') {
          return (
              <>
                 <Box left="0" top="0" w="100%" h="100%" z="0px" d={`${zNum * 0.4}px`} c="#22c55e" isSelected={isSelected} />
                 <Box left="0" top="20%" w="100%" h="80%" z={`${zNum * 0.4}px`} d={`${zNum * 0.3}px`} c="#16a34a" isSelected={isSelected} />
                 <Box left="0" top="40%" w="100%" h="60%" z={`${zNum * 0.7}px`} d={`${zNum * 0.3}px`} c="#15803d" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'kasa') {
          return (
              <>
                 <Box left="0" top="20%" w="100%" h="80%" z="0px" d={`${zNum * 0.7}px`} c="#facc15" isSelected={isSelected} />
                 <Box left="10%" top="30%" w="30%" h="30%" z={`${zNum * 0.7}px`} d={`${zNum * 0.3}px`} c="#334155" isSelected={isSelected} />
                 <Box left="10%" top="0" w="80%" h="20%" z="0px" d={`${zNum * 0.6}px`} c="#0f172a" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'kasap') {
          return (
              <>
                 <Box left="0" top="0" w="100%" h="100%" z="0px" d={`${zNum * 0.5}px`} c="#ef4444" isSelected={isSelected} />
                 <Box left="0" top="20%" w="100%" h="80%" z={`${zNum * 0.5}px`} d={`${zNum * 0.5}px`} c="rgba(255,255,255,0.4)" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'camDuvar') {
          return (
              <>
                 <Box left="0" top="30%" w="100%" h="40%" z="0px" d={`${zNum * 0.4}px`} c="#94a3b8" isSelected={isSelected} />
                 <Box left="0" top="40%" w="100%" h="20%" z={`${zNum * 0.4}px`} d={`${zNum * 0.6}px`} c="rgba(125, 211, 252, 0.4)" isSelected={isSelected} />
              </>
          );
      }
      if (toolId === 'guvenlikOdasi') {
          return (
              <>
                 <Box left="0" top="0" w="100%" h="100%" z="0px" d={`${zNum}px`} c="#cbd5e1" isSelected={isSelected} />
                 <Box left="10%" top="10%" w="80%" h="80%" z={`${zNum * 0.3}px`} d={`${zNum * 0.4}px`} c="rgba(14, 165, 233, 0.3)" isSelected={isSelected} />
              </>
          );
      }
      
      let c = '#e2e8f0';
      let isOval = false;
      if (toolId === 'koli') c = '#d97706';
      else if (toolId === 'palet') c = '#fcd34d';
      else if (toolId === 'reklamPanosu') c = '#ef4444';
      else if (toolId === 'kapi') c = '#22d3ee';
      else if (toolId === 'turnike') c = '#94a3b8';
      else if (toolId === 'kamera') c = '#020617';
      else if (toolId === 'neonTabela') c = '#06b6d4';
      else if (toolId === 'tepeLambasi' || toolId === 'sarkanLamba') c = '#fef08a';
      else if (toolId === 'cicek') c = '#15803d';
      else if (toolId === 'personel') c = '#3b82f6';
      else if (toolId === 'kareKolon') c = '#d6d3d1';
      else if (toolId === 'yuvarlakKolon') { c = '#d6d3d1'; isOval = true; }

      return <Box left="0" top="0" w="100%" h="100%" z="0px" d={`${zNum}px`} c={c} isSelected={isSelected} isOval={isOval} />;
  };

  const floorCellClass = (gridType, cell) => {
    if (!showFloor || cell.base === 'removed') {
      return 'bg-[rgba(255,255,255,0.01)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]';
    }
    if (cell.base === 'tahliyeYolu') return 'bg-red-300 shadow-[inset_0_0_0_1px_#fca5a5]';
    if (cell.base === 'gecisYolu') return 'bg-emerald-300 shadow-[inset_0_0_0_1px_#6ee7b7]';
    if (gridType === 'depot' || cell.base === 'depoZemini') return 'bg-slate-200 shadow-[inset_0_0_0_1px_#cbd5e1]';
    return 'bg-white shadow-[inset_0_0_0_1px_#e2e8f0]';
  };

  const uniqueSelectedObjects = selectedCells
    .filter(s => s && s.uid)
    .filter((sel, index, self) => self.findIndex(t => t.uid === sel.uid) === index);

  const renderSidebarToolIcon = (toolId, FallbackIcon) => {
    const getEmoji = () => {
      switch (toolId) {
        case 'manav': return '🍎';
        case 'kasap': return '🥩';
        case 'kasa': return '💵';
        case 'reyon': return '🏪';
        case 'depoRaf': return '🏗️';
        case 'koli': return '📦';
        case 'palet': return '🪵';
        case 'personel': return '👷‍♂️';
        case 'kapi': return '🚪';
        case 'turnike': return '🛂';
        case 'masa': return '🏷️';
        case 'tepeLambasi': return '💡';
        case 'sarkanLamba': return '🏮';
        case 'neonTabela': return '✨';
        case 'reklamPanosu': return '🖼️';
        case 'cicek': return '🪴';
        case 'kamera': return '📹';
        default: return null;
      }
    };
    
    const emoji = getEmoji();
    
    return (
      <div className="w-full h-full rounded-lg flex items-center justify-center bg-gradient-to-b from-slate-700 to-slate-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-slate-600">
        {emoji ? (
          <span className="text-[22px] drop-shadow-md group-hover:scale-110 transition-transform">{emoji}</span>
        ) : (
          <FallbackIcon className="w-5 h-5 text-slate-300 drop-shadow-md group-hover:scale-110 transition-transform" />
        )}
      </div>
    );
  };

  const renderMarketScene = React.useMemo(() => {
    if (activeTab !== 'market' || marketGrid.length === 0) return null;
    return (
      <div 
        onPointerLeave={() => setHoveredArea({ gridType: null, x: -1, y: -1 })}
        className={`grid gap-0 absolute transform transition-all duration-700 opacity-100 translate-x-0 scale-100 pointer-events-auto z-10`}
        style={{ gridTemplateColumns: `repeat(${marketGrid[0].length}, ${cellPx}px)`, transformStyle: 'preserve-3d' }}
      >
        {renderGhostCells('market')}
        {renderMeasurements('market')}

        {marketGrid.map((row, y) => row.map((cell, x) => {
          const isSelected = selectedCells.some(s => s.gridType === 'market' && s.uid === cell.uid);
          const isHovered = hoveredArea.gridType === 'market' && hoveredArea.x === x && hoveredArea.y === y;
          const isDrawingBase = toolsMap[currentTool]?.type === 'base';
          const previewClass = (isHovered && isDrawingBase && currentTool === 'marketZemini') ? 'bg-white/70 border-2 border-indigo-400 z-20 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : '';

          return (
          <div 
            key={`market-${x}-${y}`}
            onPointerDown={(e) => onPointerDownCell(e, 'market', x, y)}
            onPointerEnter={(e) => onPointerEnterCell(e, 'market', x, y)}
            className={`relative transition-all ${floorCellClass('market', cell)} ${previewClass} ${cell.assigned ? 'cursor-grab' : ''}`}
            style={{ width: `${cellPx}px`, height: `${cellPx}px`, transformStyle: 'preserve-3d' }}
          >
            {cell.assigned && cell.isRoot && (() => {
              const isCeilItem = ['tepeLambasi', 'sarkanLamba', 'neonTabela', 'kamera'].includes(cell.assigned);
              if (isCeilItem && !showCeiling) return null;
              if (!isCeilItem && !showFloor) return null;

              const cellW = cell.w || 1;
              const cellH = cell.h || 1;
              
              const currentCeilHeight = activeTab === 'market' ? marketCeilingHeight : depotCeilingHeight;
              const zHeightNum = parseFloat(toolsMap[cell.assigned]?.zHeight || '50');

              let translateX = (cell.offsetX / cellSize) * cellPx || 0;
              let translateY = (cell.offsetY / cellSize) * cellPx || 0;
              let translateZ = (cell.offsetZ / cellSize) * cellPx || 0;
              
              if (isCeilItem) {
                  translateZ = (currentCeilHeight * cellPx) - zHeightNum;
              }

              return (
              <div 
                className="absolute group cursor-pointer"
                style={{ width: `${cellW * 100}%`, height: `${cellH * 100}%`, transformStyle: 'preserve-3d', transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateZ(${cell.rot || 0}deg)`, transformOrigin: 'top left' }}
              >
                    {cell.hasConflict && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-2xl animate-bounce flex items-center gap-1.5 border-2 border-white pointer-events-none text-xs font-black whitespace-nowrap" style={{transform: 'translateZ(120px) translateX(-50%) translateY(-50%)'}}>
                         <span>⚠️ HATA!</span>
                      </div>
                    )}

                    {renderRealisticModel(cell.assigned, isSelected, toolsMap[cell.assigned]?.zHeight, cell.hasConflict)}
                  </div>
                );
              })()}
              
              {showCeiling && cell.base !== 'removed' && (
                  <div className="absolute top-0 left-0 pointer-events-none shadow-sm" style={{
                      width: `${cellPx}px`, height: `${cellPx}px`,
                      backgroundColor: 'rgba(226, 232, 240, 0.16)',
                      border: '1px solid rgba(203, 213, 225, 0.35)',
                      transform: `translateZ(${marketCeilingHeight * cellPx}px)`
                  }}></div>
              )}
          </div>
          );
        }))}
      </div>
    );
  }, [marketGrid, hoveredArea, selectedCells, activeTab, currentTool, showCeiling, showFloor, measurements, measuringPoint, routes, activeRoute, cellPx, marketCeilingHeight, measurementUnit]);

  const renderDepotScene = React.useMemo(() => {
    if (activeTab !== 'depot' || depotGrid.length === 0) return null;
    return (
      <div 
        onPointerLeave={() => setHoveredArea({ gridType: null, x: -1, y: -1 })}
        className={`grid gap-0 absolute transform transition-all duration-700 opacity-100 translate-x-0 scale-100 pointer-events-auto z-10`}
        style={{ gridTemplateColumns: `repeat(${depotGrid[0].length}, ${cellPx}px)`, transformStyle: 'preserve-3d' }}
      >
        {renderGhostCells('depot')}
        {renderMeasurements('depot')}

        {depotGrid.map((row, y) => row.map((cell, x) => {
          const isSelected = selectedCells.some(s => s.gridType === 'depot' && s.uid === cell.uid);
          const isHovered = hoveredArea.gridType === 'depot' && hoveredArea.x === x && hoveredArea.y === y;
          const isDrawingBase = toolsMap[currentTool]?.type === 'base';
          const previewClass = (isHovered && isDrawingBase && currentTool === 'depoZemini') ? 'bg-indigo-950/70 border-2 border-purple-400 z-20 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : '';

          return (
          <div 
            key={`depot-${x}-${y}`}
            onPointerDown={(e) => onPointerDownCell(e, 'depot', x, y)}
            onPointerEnter={(e) => onPointerEnterCell(e, 'depot', x, y)}
            className={`relative transition-all ${floorCellClass('depot', cell)} ${previewClass} ${cell.assigned ? 'cursor-grab' : ''}`}
            style={{ width: `${cellPx}px`, height: `${cellPx}px`, transformStyle: 'preserve-3d' }}
          >
            {cell.assigned && cell.isRoot && (() => {
              const isCeilItem = ['tepeLambasi', 'sarkanLamba', 'neonTabela', 'kamera'].includes(cell.assigned);
              if (isCeilItem && !showCeiling) return null;
              if (!isCeilItem && !showFloor) return null;

              const cellW = cell.w || 1;
              const cellH = cell.h || 1;
              
              const currentCeilHeight = activeTab === 'market' ? marketCeilingHeight : depotCeilingHeight;
              const zHeightNum = parseFloat(toolsMap[cell.assigned]?.zHeight || '40');

              let translateX = (cell.offsetX / cellSize) * cellPx || 0;
              let translateY = (cell.offsetY / cellSize) * cellPx || 0;
              let translateZ = (cell.offsetZ / cellSize) * cellPx || 0;
              
              if (isCeilItem) {
                  translateZ = (currentCeilHeight * cellPx) - zHeightNum;
              }
              
              return (
              <div 
                className="absolute group cursor-pointer"
                style={{ width: `${cellW * 100}%`, height: `${cellH * 100}%`, transformStyle: 'preserve-3d', transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateZ(${cell.rot || 0}deg)`, transformOrigin: 'top left' }}
              >
                    {cell.hasConflict && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-2xl animate-bounce flex items-center gap-1.5 border-2 border-white pointer-events-none text-xs font-black whitespace-nowrap" style={{transform: 'translateZ(120px) translateX(-50%) translateY(-50%)'}}>
                         <span>⚠️ HATA!</span>
                      </div>
                    )}

                    {renderRealisticModel(cell.assigned, isSelected, toolsMap[cell.assigned]?.zHeight, cell.hasConflict)}
                  </div>
                );
              })()}
              
              {showCeiling && cell.base !== 'removed' && (
                  <div className="absolute top-0 left-0 pointer-events-none shadow-sm" style={{
                      width: `${cellPx}px`, height: `${cellPx}px`,
                      backgroundColor: 'rgba(148, 163, 184, 0.16)',
                      border: '1px solid rgba(148, 163, 184, 0.35)',
                      transform: `translateZ(${depotCeilingHeight * cellPx}px)`
                  }}></div>
              )}
          </div>
          );
        }))}
      </div>
    );
  }, [depotGrid, hoveredArea, selectedCells, activeTab, currentTool, showCeiling, showFloor, measurements, measuringPoint, routes, activeRoute, cellPx, depotCeilingHeight, measurementUnit]);

  // Gerçekçi 3D İnsan Karakteri (Sadece İnsan Modunda Gösterilir)
  const renderHumanBody = () => {
      if (cameraMode !== 'human') return null;
      
      const headZ = 42; // Göz hizası
      
      return (
          <div className="absolute pointer-events-none z-[100]" style={{ left: charPos.x, top: charPos.y, width: 0, height: 0, transform: `translateZ(0px) rotateZ(${charYaw}deg)`, transformStyle: 'preserve-3d' }}>
              
              {/* Gövde (Torso) */}
              <div className="absolute" style={{ width: 14, height: 8, left: -7, top: -4, transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
                  <div className="absolute inset-0 bg-blue-600 border border-blue-800" style={{ transform: 'translateZ(14px)' }}></div>
                  <div className="absolute inset-0 bg-blue-700 border border-blue-800" style={{ transform: 'translateZ(0px)' }}></div>
                  <div className="absolute top-0 left-0 w-full bg-blue-600 border border-blue-800" style={{ height: 14, transformOrigin: 'top', transform: 'rotateX(-90deg)' }}></div>
                  <div className="absolute bottom-0 left-0 w-full bg-blue-600 border border-blue-800" style={{ height: 14, transformOrigin: 'bottom', transform: 'rotateX(90deg)' }}></div>
                  <div className="absolute top-0 left-0 h-full bg-blue-500 border border-blue-800" style={{ width: 14, transformOrigin: 'left', transform: 'rotateY(-90deg)' }}></div>
                  <div className="absolute top-0 right-0 h-full bg-blue-500 border border-blue-800" style={{ width: 14, transformOrigin: 'right', transform: 'rotateY(90deg)' }}></div>
              </div>

              {/* Baş (Head) - Kamera buranın hizasında olacak */}
              <div className="absolute" style={{ width: 10, height: 10, left: -5, top: -5, transform: `translateZ(${headZ}px)`, transformStyle: 'preserve-3d' }}>
                  <div className="absolute inset-0 bg-amber-200 border border-amber-400" style={{ transform: 'translateZ(10px)' }}></div>
                  <div className="absolute inset-0 bg-amber-300 border border-amber-400" style={{ transform: 'translateZ(0px)' }}></div>
                  <div className="absolute top-0 left-0 w-full bg-amber-200 border border-amber-400" style={{ height: 10, transformOrigin: 'top', transform: 'rotateX(-90deg)' }}></div>
                  <div className="absolute bottom-0 left-0 w-full bg-amber-300 border border-amber-400" style={{ height: 10, transformOrigin: 'bottom', transform: 'rotateX(90deg)' }}></div>
                  <div className="absolute top-0 left-0 h-full bg-amber-100 border border-amber-400" style={{ width: 10, transformOrigin: 'left', transform: 'rotateY(-90deg)' }}></div>
                  <div className="absolute top-0 right-0 h-full bg-amber-100 border border-amber-400" style={{ width: 10, transformOrigin: 'right', transform: 'rotateY(90deg)' }}></div>
              </div>

              {/* Sol Kol (Left Arm) */}
              <div className="absolute" style={{ left: -11, top: -2, transform: 'translateZ(36px)', transformStyle: 'preserve-3d' }}>
                  <div className={`origin-top ${isCharMoving ? 'animate-[walkL_0.6s_ease-in-out_infinite_alternate]' : ''}`} style={{ width: 4, height: 4, transformStyle: 'preserve-3d' }}>
                      <div className="absolute top-0 left-0 w-full bg-blue-400 border border-blue-600" style={{ height: 16, transformOrigin: 'top', transform: 'rotateX(90deg)' }}></div>
                  </div>
              </div>

              {/* Sağ Kol (Right Arm) */}
              <div className="absolute" style={{ left: 7, top: -2, transform: 'translateZ(36px)', transformStyle: 'preserve-3d' }}>
                  <div className={`origin-top ${isCharMoving ? 'animate-[walkR_0.6s_ease-in-out_infinite_alternate]' : ''}`} style={{ width: 4, height: 4, transformStyle: 'preserve-3d' }}>
                      <div className="absolute top-0 left-0 w-full bg-blue-400 border border-blue-600" style={{ height: 16, transformOrigin: 'top', transform: 'rotateX(90deg)' }}></div>
                  </div>
              </div>

              {/* Sol Bacak (Left Leg) */}
              <div className="absolute" style={{ left: -6, top: -2, transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
                  <div className={`origin-top ${isCharMoving ? 'animate-[walkR_0.6s_ease-in-out_infinite_alternate]' : ''}`} style={{ width: 5, height: 4, transformStyle: 'preserve-3d' }}>
                      <div className="absolute top-0 left-0 w-full bg-slate-700 border border-slate-900" style={{ height: 24, transformOrigin: 'top', transform: 'rotateX(90deg)' }}></div>
                  </div>
              </div>

              {/* Sağ Bacak (Right Leg) */}
              <div className="absolute" style={{ left: 1, top: -2, transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
                  <div className={`origin-top ${isCharMoving ? 'animate-[walkL_0.6s_ease-in-out_infinite_alternate]' : ''}`} style={{ width: 5, height: 4, transformStyle: 'preserve-3d' }}>
                      <div className="absolute top-0 left-0 w-full bg-slate-700 border border-slate-900" style={{ height: 24, transformOrigin: 'top', transform: 'rotateX(90deg)' }}></div>
                  </div>
              </div>

          </div>
      );
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 font-sans text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Market Planlayıcı</h1>
            <p className="text-xs text-slate-400 mt-1">Giriş Yaparak Tasarıma Başlayın</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition text-sm mt-2 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sisteme Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 text-slate-100 overflow-hidden font-sans select-none relative">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes walkL {
            from { transform: rotateX(25deg); }
            to { transform: rotateX(-25deg); }
        }
        @keyframes walkR {
            from { transform: rotateX(-25deg); }
            to { transform: rotateX(25deg); }
        }
      `}</style>

      {globalWarning && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-red-600/95 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.4)] animate-bounce flex items-center gap-3 border-2 border-red-400 backdrop-blur-md">
            <div className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center font-black text-xl shadow-inner">!</div>
            <span className="font-bold text-sm tracking-wide">{warningMessage}</span>
        </div>
      )}

      {activeRoute && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 border border-slate-700 p-3 rounded-2xl shadow-2xl flex gap-3 backdrop-blur-md ui-panel">
              <span className="text-white flex items-center px-2 text-sm font-bold">Güzergâh Çiziliyor...</span>
              <button onClick={() => {
                  if (activeRoute.points.length > 1) setRoutes(prev => [...prev, activeRoute]);
                  setActiveRoute(null);
                  setCurrentTool(null);
              }} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition">Tamamla</button>
              <button onClick={() => { setActiveRoute(null); setCurrentTool(null); }} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition">İptal Et</button>
          </div>
      )}

      {/* SOL ÜST MENÜ & KONTROLLER */}
      <div 
        className="absolute top-4 left-4 z-40 flex flex-col gap-3 transition-all duration-300 ui-panel"
        style={{ transform: sidebarOpen ? 'translateX(336px)' : 'translateX(0px)' }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-slate-800/90 hover:bg-slate-700 text-white p-2.5 rounded-xl border border-slate-700 shadow-2xl transition backdrop-blur flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => { setIs3D(false); setCamRotX(0); setCamRotZ(0); setCamPanX(0); setCamPanY(0); setCamZoom(1); }} className={`px-3 py-2 rounded-l-xl border border-slate-700 text-xs font-semibold transition backdrop-blur flex items-center gap-1.5 ${!is3D && cameraMode !== 'human' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}>
            <Map className="w-4 h-4" /> 2D
          </button>
          <button onClick={() => changeCameraMode('isometric')} className={`px-3 py-2 border-y border-r border-slate-700 text-xs font-semibold transition backdrop-blur flex items-center gap-1.5 ${is3D && cameraMode === 'isometric' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}>
            <Box className="w-4 h-4" /> 3D
          </button>
          <button onClick={() => changeCameraMode('human')} className={`px-3 py-2 rounded-r-xl border-y border-r border-slate-700 text-xs font-semibold transition backdrop-blur flex items-center gap-1.5 ${is3D && cameraMode === 'human' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}>
            <User className="w-4 h-4" /> İnsan
          </button>
        </div>
        
        <div className="relative flex flex-col items-start pointer-events-auto gap-2">
          
          {/* TEK MERKEZ CETVEL VE AYARLAR MENÜSÜ */}
          <button 
              onClick={() => { setIsRulerMenuOpen(!isRulerMenuOpen); setCurrentTool(null); }}
              className={`p-2.5 rounded-xl border shadow-2xl transition backdrop-blur flex items-center justify-center ${isRulerMenuOpen ? 'bg-yellow-600 text-white border-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.5)]' : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700'}`}
              title="Cetvel ve Ayarlar"
          >
              <Ruler className="w-5 h-5 text-blue-400" />
          </button>
          {isRulerMenuOpen && (
              <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRulerMenuOpen(false)}></div>
                  <div className="absolute top-12 left-0 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-fade-in text-sm w-[290px] flex flex-col gap-4 z-50">
                      
                      {/* A. MESAFE ÖLÇ */}
                      <div className="border-b border-slate-700/50 pb-3 mb-1">
                          <button 
                              onClick={() => {
                                  setCurrentTool(currentTool === 'olcumMesafe' ? null : 'olcumMesafe');
                                  setIsRulerMenuOpen(false);
                              }}
                              className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${currentTool === 'olcumMesafe' ? 'bg-yellow-600 text-white border-yellow-500 shadow-lg' : 'bg-slate-800/80 text-yellow-400 border-yellow-900/50 hover:bg-slate-700'}`}
                          >
                              <Ruler className="w-4 h-4" /> MESAFE ÖLÇ
                          </button>
                      </div>

                      {/* B. ZEMİN - TAVAN MESAFESİ (Metre ve Santimetre Ayrı) */}
                      <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Tavan Yüksekliği</label>
                          <div className="flex gap-2">
                              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg flex overflow-hidden">
                                  <input 
                                      type="number" min="2" max="10" 
                                      className="w-full bg-transparent text-white p-2 text-center font-bold outline-none" 
                                      value={Math.floor(activeTab === 'market' ? Math.max(2, marketCeilingHeight) : Math.max(2, depotCeilingHeight))}
                                      onChange={e => {
                                          const m = Math.max(2, parseInt(e.target.value) || 2);
                                          const currentH = activeTab === 'market' ? marketCeilingHeight : depotCeilingHeight;
                                          const cm = currentH % 1;
                                          const val = m + cm;
                                          if (activeTab === 'market') setMarketCeilingHeight(val);
                                          else setDepotCeilingHeight(val);
                                      }}
                                  />
                                  <span className="bg-slate-700 text-slate-300 px-2 flex items-center text-[10px] font-bold">M</span>
                              </div>
                              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg flex overflow-hidden">
                                  <input 
                                      type="number" min="0" max="99" 
                                      className="w-full bg-transparent text-white p-2 text-center font-bold outline-none" 
                                      value={Math.round(((activeTab === 'market' ? marketCeilingHeight : depotCeilingHeight) % 1) * 100)}
                                      onChange={e => {
                                          const cm = parseInt(e.target.value) || 0;
                                          const currentH = activeTab === 'market' ? marketCeilingHeight : depotCeilingHeight;
                                          const m = Math.floor(currentH);
                                          const val = Math.max(2, m + (cm / 100));
                                          if (activeTab === 'market') setMarketCeilingHeight(val);
                                          else setDepotCeilingHeight(val);
                                      }}
                                  />
                                  <span className="bg-slate-700 text-slate-300 px-2 flex items-center text-[10px] font-bold">CM</span>
                              </div>
                          </div>
                      </div>

                      {/* C. ÖLÇÜM BİRİMLERİ (Metre ve Santimetre yan yana) */}
                      <div className="flex gap-2 border-t border-slate-700/50 pt-3 mt-2">
                          <button 
                              onClick={() => setMeasurementUnit('m')}
                              className={`flex-1 py-2 rounded-lg border font-bold text-[11px] transition flex items-center justify-center gap-1 ${measurementUnit === 'm' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700'}`}
                          >
                              Metre
                          </button>
                          <button 
                              onClick={() => setMeasurementUnit('cm')}
                              className={`flex-1 py-2 rounded-lg border font-bold text-[11px] transition flex items-center justify-center gap-1 ${measurementUnit === 'cm' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700'}`}
                          >
                              Santimetre
                          </button>
                      </div>

                      {/* D. DİĞER MEVCUT CETVEL AYARLARI (Boyut ve Zemin Çiz) */}
                      <div className="flex flex-col gap-3 border-t border-slate-700/50 pt-3 mt-1">
                          <div className="flex items-center justify-between text-blue-400 font-bold bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-500/30">
                              <span className="uppercase tracking-widest text-[11px]">{activeTab === 'market' ? 'Market' : 'Depo'} Alan Boyutu</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5"><span className="text-[11px] text-slate-400">En:</span><input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1 text-center text-white outline-none" value={activeTab === 'market' ? marketW : depotW} onChange={e => activeTab==='market' ? setMarketW(parseFloat(e.target.value)) : setDepotW(parseFloat(e.target.value))} /></div>
                              <span className="text-slate-500 font-bold">x</span>
                              <div className="flex items-center gap-1.5"><span className="text-[11px] text-slate-400">Boy:</span><input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1 text-center text-white outline-none" value={activeTab === 'market' ? marketH : depotH} onChange={e => activeTab==='market' ? setMarketH(parseFloat(e.target.value)) : setDepotH(parseFloat(e.target.value))} /></div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                              <button onClick={() => setCurrentTool(activeTab === 'market' ? 'marketZemini' : 'depoZemini')} className={`flex-1 py-1.5 rounded border flex items-center justify-center gap-1.5 font-bold text-[11px] transition ${['marketZemini', 'depoZemini'].includes(currentTool) ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>
                                  <Hammer className="w-3.5 h-3.5" /> Zemin Çiz
                              </button>
                              <button onClick={() => setCurrentTool('zeminSil')} className={`flex-1 py-1.5 rounded border flex items-center justify-center gap-1.5 font-bold text-[11px] transition ${currentTool === 'zeminSil' ? 'bg-red-600 text-white border-red-500 shadow-lg' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>
                                  <X className="w-3.5 h-3.5" /> Zemini Sil
                              </button>
                          </div>
                      </div>

                  </div>
              </>
          )}
        </div>
      </div>

      {/* --- SAĞ ÜST TAMAMEN BAĞIMSIZ PANELLER (Biri açılınca diğeri görünmez) --- */}

      {/* PANEL 1: SEÇİLİ NESNE ÖZELLİKLERİ İNSPEKTÖRÜ */}
      {uniqueSelectedObjects.length > 0 && currentTool === null && (
          <div className="absolute top-4 right-4 z-40 w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3 backdrop-blur-xl animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar ui-panel">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-white leading-tight uppercase">
                      {uniqueSelectedObjects.length > 1 ? `${uniqueSelectedObjects.length} Öğe Seçili` : 'Öğe Ayarları'}
                    </h3>
                  </div>
                </div>
                <button onClick={() => setSelectedCells([])} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {uniqueSelectedObjects.length > 1 ? (
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-600 mb-2">
                            <span className="text-[10px] font-bold text-slate-300 uppercase">Grup Seçimi ({uniqueSelectedObjects.length})</span>
                            <button onClick={() => deleteSelectedObjects()} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 hover:bg-red-500/40 transition">Tümünü Kaldır</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                           {uniqueSelectedObjects.map((sel) => {
                             const itemIcon = toolsMap[sel.data.assigned]?.icon;
                             return (
                               <div key={sel.uid} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                   <div className="flex items-center gap-2">
                                     <div className="w-5 h-5 rounded bg-slate-700 text-slate-400 flex items-center justify-center">
                                        {itemIcon && React.createElement(itemIcon, {className: "w-3 h-3"})}
                                     </div>
                                     <span className="font-bold text-slate-300 text-[10px] truncate max-w-[120px]">{sel.data.name || 'İsimsiz'}</span>
                                   </div>
                                   <button onClick={(e) => { e.stopPropagation(); deleteSelectedObjects(sel.uid); }} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition"><X className="w-3.5 h-3.5" /></button>
                               </div>
                             );
                           })}
                        </div>
                    </div>
                ) : (
                   uniqueSelectedObjects.map((sel) => {
                     const isExpanded = expandedInspectorId === sel.uid || expandedInspectorId === null;
                     const itemIcon = toolsMap[sel.data.assigned]?.icon;
                     const realX = (sel.data.isRoot ? sel.x : sel.x) * cellSize + (sel.data.offsetX || 0);
                     const realY = (sel.data.isRoot ? sel.y : sel.y) * cellSize + (sel.data.offsetY || 0);
                     const realZ = (sel.data.offsetZ || 0);
                     
                     return (
                       <div key={sel.uid} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-500 bg-blue-900/10' : 'border-slate-700 bg-slate-800/50'}`}>
                         <div className="p-2 flex items-center justify-between cursor-pointer" onClick={() => setExpandedInspectorId(isExpanded ? null : sel.uid)}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-700 text-slate-400 flex items-center justify-center">
                                 {itemIcon && React.createElement(itemIcon, {className: "w-3.5 h-3.5"})}
                              </div>
                              <div>
                                 <h4 className="font-bold text-white text-[11px] leading-tight">{sel.data.name || 'İsimsiz'}</h4>
                                 <span className="text-[9px] text-slate-400 uppercase tracking-wider">{toolsMap[sel.data.assigned]?.title}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={(e) => { e.stopPropagation(); deleteSelectedObjects(sel.uid); }} className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-700 transition">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                         </div>
                         
                         {isExpanded && (
                          <div className="p-2 border-t border-slate-700/50 bg-slate-900/50">
                            <label className="block text-slate-400 mb-1.5 font-medium flex items-center justify-between text-[10px]">
                              <span>Konum (X, Y, Z)</span>
                              <select className="bg-slate-800 border border-slate-600 rounded text-white p-0.5 outline-none" value={moveStep} onChange={e => setMoveStep(parseFloat(e.target.value))}>
                                  <option value={1}>1 m (Izgara)</option>
                                  <option value={0.5}>50 cm</option>
                                  <option value={0.1}>10 cm</option>
                                  <option value={0.01}>1 cm</option>
                              </select>
                            </label>
                            <div className="flex gap-1 mb-2">
                                <div className="flex-1 bg-slate-800 rounded border border-slate-700 flex overflow-hidden">
                                    <span className="px-1.5 bg-slate-700 text-slate-300 flex items-center">X</span>
                                    <input type="number" step={moveStep} value={realX.toFixed(3)} onChange={e => updatePrecisionCoordinate(sel.uid, 'x', e.target.value)} className="w-full bg-transparent p-1 text-white outline-none text-center" />
                                </div>
                                <div className="flex-1 bg-slate-800 rounded border border-slate-700 flex overflow-hidden">
                                    <span className="px-1.5 bg-slate-700 text-slate-300 flex items-center">Y</span>
                                    <input type="number" step={moveStep} value={realY.toFixed(3)} onChange={e => updatePrecisionCoordinate(sel.uid, 'y', e.target.value)} className="w-full bg-transparent p-1 text-white outline-none text-center" />
                                </div>
                                <div className="flex-1 bg-slate-800 rounded border border-slate-700 flex overflow-hidden">
                                    <span className="px-1.5 bg-slate-700 text-slate-300 flex items-center">Z</span>
                                    <input type="number" step={moveStep} value={realZ.toFixed(3)} onChange={e => updatePrecisionCoordinate(sel.uid, 'z', e.target.value)} className="w-full bg-transparent p-1 text-white outline-none text-center" />
                                </div>
                            </div>
                            
                            <label className="block text-slate-400 mb-1.5 font-medium text-[10px] mt-2">Döndürme (Rotasyon)</label>
                            <div className="flex gap-1 items-center bg-slate-800 rounded border border-slate-700 overflow-hidden">
                                <input type="number" value={sel.data.rot || 0} onChange={e => updatePrecisionCoordinate(sel.uid, 'rot', e.target.value)} className="w-full bg-transparent p-1 text-white outline-none text-center" />
                                <span className="px-2 text-slate-400">Derece</span>
                            </div>
                          </div>
                         )}
                       </div>
                     );
                   })
                )}
              </div>
          </div>
      )}

      {/* PANEL 4: ÖLÇÜM SONUÇLARI (Sağ Üstte Bağımsız Görünüm) */}
      {currentTool === 'olcumMesafe' && (
          <div className="absolute top-4 right-4 z-40 w-72 bg-slate-900/95 border border-yellow-500/50 rounded-2xl shadow-2xl p-3 backdrop-blur-xl animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar ui-panel">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-yellow-600/20 text-yellow-400 flex items-center justify-center text-sm font-bold border border-yellow-500/30">
                    <Ruler className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-white leading-tight uppercase">Ölçümler</h3>
                  </div>
                </div>
                <button onClick={() => { setCurrentTool(null); setMeasuringPoint(null); }} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                 <button onClick={() => { setMeasurements([]); setMeasuringPoint(null); }} className="w-full py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-bold text-[11px] transition">
                     Tüm Ölçümleri Temizle
                 </button>
                 {measurements.length === 0 ? (
                     <p className="text-[10px] text-slate-400 italic text-center p-2">Ölçüm yapmak için zeminde iki nokta seçin.</p>
                 ) : (
                     <div className="space-y-1">
                       {measurements.map((m, idx) => (
                           <div key={m.id} className="flex justify-between items-center bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/50">
                               <span className="text-slate-400 font-medium text-[10px]">Ölçüm {idx + 1}</span>
                               <div className="flex items-center gap-3">
                                   <span className="text-yellow-400 font-bold text-sm tracking-wide">{formatDist(m.distance)}</span>
                                   <button onClick={() => setMeasurements(prev => prev.filter(x => x.id !== m.id))} className="text-red-400 hover:text-red-300 bg-red-500/10 p-1 rounded"><X className="w-3 h-3"/></button>
                               </div>
                           </div>
                       ))}
                     </div>
                 )}
              </div>
          </div>
      )}

      {/* PANEL 3: GÜZERGÂH TEMİZLEME PANELİ */}
      {toolsMap[currentTool]?.type === 'route' && (
          <div className="absolute top-4 right-4 z-40 w-72 bg-slate-900/95 border border-indigo-500/50 rounded-2xl shadow-2xl p-3 backdrop-blur-xl animate-fade-in max-h-[85vh] overflow-y-auto no-scrollbar ui-panel">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-500/30">
                    <Route className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-white leading-tight uppercase">GÜZERGÂH</h3>
                  </div>
                </div>
                <button onClick={() => { setCurrentTool(null); setActiveRoute(null); }} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                  {routes.length > 0 && (
                      <button onClick={() => setRoutes([])} className="w-full py-1.5 mt-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-bold text-[11px] transition">
                          Tüm Güzergâhları Temizle
                      </button>
                  )}
                  <p className="text-[10px] text-slate-400 italic text-center p-1">Zeminde tıklayarak güzergâh oluşturun. Hatlar otomatik düzleştirilecektir.</p>
              </div>
          </div>
      )}

      {/* SOL KANAT SIDEBAR */}
      <aside 
        className={`absolute top-0 left-0 h-full w-80 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-r border-slate-800 flex flex-col z-30 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ui-panel`}
      >
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between h-16 bg-slate-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Market Planlayıcı</h1>
              <p className="text-[10px] text-indigo-300">Gelişmiş 3D Proje & Ölçüm</p>
            </div>
          </div>
        </div>

        <div className="flex p-2 bg-slate-950/40 border-b border-slate-800/50 gap-2">
          <button onClick={() => { setActiveTab('market'); setCurrentTool(null); setSelectedCells([]); }} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === 'market' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'}`}>
            <Store className="w-4 h-4" /> Market Alanı
          </button>
          <button onClick={() => { setActiveTab('depot'); setCurrentTool(null); setSelectedCells([]); }} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === 'depot' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'}`}>
            <Package className="w-4 h-4" /> Depo Alanı
          </button>
        </div>

        <div className="flex gap-2 p-3 bg-slate-950/40 border-b border-slate-800/50">
          <label className="flex-1 flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-300 cursor-pointer bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-700 transition">
            Zemin
            <input type="checkbox" checked={showFloor} onChange={e => setShowFloor(e.target.checked)} className="accent-blue-500 rounded w-3.5 h-3.5" /> 
          </label>
          <label className="flex-1 flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-300 cursor-pointer bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-700 transition">
            Tavan
            <input type="checkbox" checked={showCeiling} onChange={e => setShowCeiling(e.target.checked)} className="accent-blue-500 rounded w-3.5 h-3.5" /> 
          </label>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
          {categories.filter(cat => activeTab === 'market' ? (cat.id.startsWith('market') || cat.id === 'guzergah') : (cat.id.startsWith('depo') || cat.id === 'guzergah')).map(cat => {
            const CatIcon = cat.icon;
            const isOpen = openCats[cat.id];
            
            return (
              <div key={cat.id} className="relative bg-slate-900/40 rounded-xl border border-slate-800/50 p-3">
                <div className="flex items-center justify-between mb-1 px-1">
                  <div className="flex items-center gap-2 cursor-pointer group flex-1" onClick={() => toggleCat(cat.id)}>
                    <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <CatIcon className="w-3.5 h-3.5 text-blue-400" /> {cat.name}
                    </h3>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
            
                <div className={`flex flex-col gap-2.5 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0 m-0'}`}>
                  {cat.tools.map(tool => {
                    const isSelected = currentTool === tool.id;
                    const ToolIcon = tool.icon;
                    return (
                      <div 
                        key={tool.id}
                        onClick={() => { setCurrentTool(tool.id); }}
                        className={`flex items-center justify-between rounded-xl p-3 cursor-pointer border transition relative group ${isSelected ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'}`}
                      >
                        <span className="text-[12px] font-bold text-slate-200 leading-tight">
                          {tool.title}
                        </span>
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                          {renderSidebarToolIcon(tool.id, ToolIcon)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 3D SAHNE ALANI */}
      <main 
        ref={mainContainerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{ background: 'radial-gradient(circle at center, #1e293b 0%, #312e81 35%, #020617 100%)', perspective: '2000px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      >
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-transform transform-gpu ${cameraMode === 'human' ? 'duration-0' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: cameraMode === 'human' 
              ? `perspective(800px) rotateX(${charPitch}deg) rotateZ(${-charYaw}deg) translate3d(${-charPos.x}px, ${-charPos.y}px, -48px)`
              : `translate3d(${camPanX}px, ${camPanY}px, 0) rotateX(${camRotX}deg) rotateZ(${camRotZ}deg) scale3d(${camZoom}, ${camZoom}, ${camZoom})`
          }}
        >
          {activeTab === 'market' && marketGrid.length > 0 && renderMarketScene}
          {activeTab === 'depot' && depotGrid.length > 0 && renderDepotScene}
          {renderHumanBody()}
        </div>

        {/* İnsan Modu FPS Crosshair */}
        {cameraMode === 'human' && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[200]">
               <Crosshair className="w-6 h-6 text-white/50" />
           </div>
        )}
      </main>
    </div>
  );
}