import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Animated, Dimensions, StatusBar,
  ImageBackground, ScrollView, SafeAreaView, Platform,
} from 'react-native';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

var BG      = '#0A0A0F';
var SURFACE = '#13131A';
var CARD    = '#1A1A24';
var BORDER  = '#2A2A3A';
var NEON    = '#C8FF00';
var PURPLE  = '#9B5CFF';
var GOLD    = '#FFD700';
var ROSE    = '#FF3D6B';
var CYAN    = '#00E5FF';
var WHITE   = '#FFFFFF';
var GREY1   = '#8A8A9A';
var GREY2   = '#3A3A4A';
var TXTPRIM = '#F0F0FF';

var TEMPLATES = [
  {
    id: '1',
    title: 'The System',
    subtitle: 'Attitude · Dark SUV · Raw Power',
    accent: NEON,
    tag: 'TRENDING',
    tagColor: NEON,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    result: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  },
  {
    id: '2',
    title: 'Divine Aura',
    subtitle: 'Spiritual · Glowing · Sacred',
    accent: PURPLE,
    tag: 'VIRAL',
    tagColor: ROSE,
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80',
    result: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: '3',
    title: 'Fame & Success',
    subtitle: '3D Followers · Golden Era · Legacy',
    accent: GOLD,
    tag: 'HOT',
    tagColor: GOLD,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    result: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  },
  {
    id: '4',
    title: 'Cinematic Lofi',
    subtitle: 'Romantic · Sunset · Double Exposure',
    accent: ROSE,
    tag: 'AESTHETIC',
    tagColor: CYAN,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    result: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  },
];

// ── ADMOB NOTES ──────────────────────────────────────────────────────────
// 1. expo install react-native-google-mobile-ads
// 2. app.json: "react-native-google-mobile-ads": { "android_app_id": "ca-app-pub-XXXX~XXXX" }
// 3. Replace BannerAdPlaceholder with: <BannerAd unitId="..." size={BannerAdSize.BANNER} />
// 4. Replace setTimeout in MockAd with: loadAndShowRewardedAd(onFinish)
// ─────────────────────────────────────────────────────────────────────────

function PulseDot(props) {
  var scale = useRef(new Animated.Value(1)).current;
  useEffect(function() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: props.color, transform: [{ scale: scale }] }} />
  );
}

function ProgressBar(props) {
  var anim = useRef(new Animated.Value(0)).current;
  useEffect(function() {
    Animated.timing(anim, { toValue: props.progress, duration: 350, useNativeDriver: false }).start();
  }, [props.progress]);
  var w = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  return (
    <View style={S.track}>
      <Animated.View style={[S.fill, { width: w, backgroundColor: props.color }]} />
    </View>
  );
}

function MockAd(props) {
  var cd = useState(3);
  var countdown = cd[0];
  var setCountdown = cd[1];
  var fade  = useRef(new Animated.Value(0)).current;
  var scale = useRef(new Animated.Value(0.85)).current;

  useEffect(function() {
    if (!props.visible) { return; }
    setCountdown(3);
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
    var iv = setInterval(function() {
      setCountdown(function(p) { return p <= 1 ? (clearInterval(iv), 0) : p - 1; });
    }, 1000);
    // ADMOB: replace setTimeout below with loadAndShowRewardedAd(props.onFinish)
    var t = setTimeout(function() {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 0,    duration: 250, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.85, duration: 250, useNativeDriver: true }),
      ]).start(function() { props.onFinish(); });
    }, 3000);
    return function() { clearInterval(iv); clearTimeout(t); };
  }, [props.visible]);

  if (!props.visible) { return null; }
  return (
    <Modal transparent animationType="none" visible={props.visible}>
      <View style={S.adBg}>
        <Animated.View style={[S.adBox, { opacity: fade, transform: [{ scale: scale }], borderColor: props.accent }]}>
          <Text style={S.adTitle}>Rewarded Ad</Text>
          <Text style={S.adSub}>Watch a short ad to generate your AI photo</Text>
          <View style={[S.adMock, { borderColor: props.accent }]}>
            <Text style={S.adMockTxt}>[ MOCK AD PLACEHOLDER ]</Text>
            <Text style={S.adMockSub}>Replace with real AdMob Rewarded Ad</Text>
          </View>
          <View style={[S.cdRing, { borderColor: props.accent }]}>
            <Text style={[S.cdNum, { color: props.accent }]}>{countdown}</Text>
          </View>
          <Text style={[S.cdLabel, { color: props.accent }]}>
            {countdown > 0 ? 'Finishing in ' + countdown + 's...' : 'Almost done!'}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Banner() {
  return (
    <View style={S.banner}>
      <Text style={S.bannerTxt}>[ Banner Ad - ca-app-pub-XXXX/XXXX ]</Text>
    </View>
  );
}

function Card(props) {
  var item = props.item;
  var shimmer   = useRef(new Animated.Value(0)).current;
  var cardScale = useRef(new Animated.Value(1)).current;
  useEffect(function() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  var glow = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  return (
    <Animated.View style={[S.cardWrap, { transform: [{ scale: cardScale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={function() { props.onPress(item); }}
        onPressIn={function() { Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true }).start(); }}
        onPressOut={function() { Animated.spring(cardScale, { toValue: 1, friction: 3, useNativeDriver: true }).start(); }}
      >
        <ImageBackground source={{ uri: item.image }} style={S.cardImg} imageStyle={S.cardImgStyle}>
          <View style={S.cardOverlay} />
          <Animated.View style={[S.cardBorder, { borderColor: item.accent, opacity: glow }]} />
          <View style={S.cardTop}>
            <View style={[S.tag, { borderColor: item.tagColor, backgroundColor: item.tagColor + '22' }]}>
              <Text style={[S.tagTxt, { color: item.tagColor }]}>{item.tag}</Text>
            </View>
          </View>
          <View style={S.cardBot}>
            <Text style={S.cardTitle}>{item.title}</Text>
            <Text style={S.cardSub}>{item.subtitle}</Text>
            <TouchableOpacity style={[S.cta, { backgroundColor: item.accent }]} onPress={function() { props.onPress(item); }}>
              <Text style={S.ctaTxt}>Create Now</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  var sc = useState('HOME');
  var screen = sc[0]; var setScreen = sc[1];
  var tp = useState(null);
  var tmpl = tp[0]; var setTmpl = tp[1];
  var pg = useState(0);
  var prog = pg[0]; var setProg = pg[1];
  var lb = useState('Uploading Image...');
  var label = lb[0]; var setLabel = lb[1];
  var ad = useState(false);
  var showAd = ad[0]; var setShowAd = ad[1];
  var pulse = useRef(new Animated.Value(1)).current;

  useEffect(function() {
    if (screen !== 'RESULT') { return; }
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [screen]);

  function goCreate(t) {
    setTmpl(t); setProg(0); setLabel('Uploading Image...'); setScreen('PROCESSING');
    var pct = 0;
    var iv = setInterval(function() {
      pct += Math.random() * 12 + 4;
      if (pct >= 100) {
        clearInterval(iv); setProg(100); setLabel('Upload Complete!');
        setTimeout(function() { setShowAd(true); }, 700);
      } else {
        var v = Math.min(pct, 99);
        setProg(v);
        if (pct > 60) { setLabel('Applying AI Model...'); }
        else if (pct > 30) { setLabel('Analyzing Photo...'); }
      }
    }, 200);
  }

  function reset() { setScreen('HOME'); setTmpl(null); setProg(0); }

  var acc = tmpl ? tmpl.accent : NEON;

  if (screen === 'HOME') {
    return (
      <SafeAreaView style={S.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={S.hdr}>
          <View>
            <Text style={S.hdrEye}>AI PHOTO STUDIO</Text>
            <Text style={S.hdrTitle}>{'Make Your '}<Text style={{ color: NEON }}>Photo</Text>{'\nGo Viral'}</Text>
          </View>
          <View style={S.hdrBadge}>
            <PulseDot color={NEON} />
            <Text style={S.hdrBadgeTxt}>LIVE</Text>
          </View>
        </View>
        <FlatList
          data={TEMPLATES}
          keyExtractor={function(i) { return i.id; }}
          contentContainerStyle={S.list}
          showsVerticalScrollIndicator={false}
          renderItem={function(r) { return <Card item={r.item} onPress={goCreate} />; }}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
        <Banner />
      </SafeAreaView>
    );
  }

  if (screen === 'PROCESSING') {
    var steps = ['Upload', 'Analyze', 'AI Model', 'Render'];
    return (
      <SafeAreaView style={S.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <MockAd visible={showAd} onFinish={function() { setShowAd(false); setScreen('RESULT'); }} accent={acc} />
        <View style={S.procWrap}>
          <ImageBackground source={{ uri: tmpl ? tmpl.image : '' }} style={S.procImg} imageStyle={{ borderRadius: 20 }}>
            <View style={[S.procOverlay, { borderColor: acc }]} />
            <Text style={[S.procName, { color: acc }]}>{tmpl ? tmpl.title : ''}</Text>
          </ImageBackground>
          <Text style={S.procTitle}>Processing Your Photo</Text>
          <Text style={[S.procLabel, { color: acc }]}>{label}</Text>
          <ProgressBar progress={prog} color={acc} />
          <Text style={S.procPct}>{Math.round(prog) + '%'}</Text>
          <View style={S.stepRow}>
            {steps.map(function(s, i) {
              var done = prog > i * 25 + 10;
              return (
                <View key={s} style={S.stepItem}>
                  <View style={[S.stepDot, done ? { backgroundColor: acc } : null]} />
                  <Text style={[S.stepLbl, done ? { color: acc } : null]}>{s}</Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={S.backBtn} onPress={reset}>
            <Text style={S.backTxt}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'RESULT') {
    var stats = [
      { l: 'Style',   v: tmpl ? tmpl.title : '' },
      { l: 'Quality', v: '4K Ultra' },
      { l: 'Format',  v: 'PNG' },
    ];
    return (
      <SafeAreaView style={S.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView contentContainerStyle={S.resWrap} showsVerticalScrollIndicator={false}>
          <View style={[S.badge, { borderColor: acc, backgroundColor: acc + '18' }]}>
            <Text style={[S.badgeTxt, { color: acc }]}>AI Photo Ready!</Text>
          </View>
          <Text style={S.resTitle}>{'Your Masterpiece\nis Generated'}</Text>
          <View style={[S.resImgWrap, { borderColor: acc }]}>
            <ImageBackground source={{ uri: tmpl ? tmpl.result : '' }} style={S.resImg} imageStyle={{ borderRadius: 18 }}>
              <View style={S.watermark}>
                <Text style={S.watermarkTxt}>{tmpl ? tmpl.title : ''}</Text>
              </View>
            </ImageBackground>
          </View>
          <View style={S.statsRow}>
            {stats.map(function(s) {
              return (
                <View key={s.l} style={[S.statBox, { borderColor: BORDER }]}>
                  <Text style={[S.statVal, { color: acc }]}>{s.v}</Text>
                  <Text style={S.statLbl}>{s.l}</Text>
                </View>
              );
            })}
          </View>
          <Animated.View style={[S.saveBtnWrap, { transform: [{ scale: pulse }] }]}>
            <TouchableOpacity style={[S.saveBtn, { backgroundColor: acc }]} onPress={function() { alert('Integrate expo-media-library to save!'); }}>
              <Text style={S.saveTxt}>Save to Gallery</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={S.secRow}>
            <TouchableOpacity style={[S.secBtn, { borderColor: acc }]}>
              <Text style={[S.secTxt, { color: acc }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.secBtn, { borderColor: GREY2 }]} onPress={reset}>
              <Text style={[S.secTxt, { color: GREY1 }]}>Try Another</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
        <Banner />
      </SafeAreaView>
    );
  }

  return null;
}

var S = StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  hdr:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 48 : 16, paddingBottom: 16 },
  hdrEye:     { color: GREY1, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
  hdrTitle:   { color: TXTPRIM, fontSize: 26, fontWeight: '800', lineHeight: 32 },
  hdrBadge:   { flexDirection: 'row', alignItems: 'center', backgroundColor: NEON + '15', borderRadius: 20, borderWidth: 1, borderColor: NEON + '40', paddingHorizontal: 10, paddingVertical: 6 },
  hdrBadgeTxt:{ color: NEON, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginLeft: 4 },
  list:       { paddingHorizontal: 16, paddingTop: 4 },
  cardWrap:   { borderRadius: 24, overflow: 'hidden', backgroundColor: CARD, marginBottom: 18, elevation: 12 },
  cardImg:    { width: '100%', height: H * 0.38, justifyContent: 'space-between' },
  cardImgStyle: { borderRadius: 24 },
  cardOverlay:{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,8,12,0.55)', borderRadius: 24 },
  cardBorder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24, borderWidth: 1.5 },
  cardTop:    { padding: 16 },
  tag:        { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt:     { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  cardBot:    { padding: 18 },
  cardTitle:  { color: WHITE, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  cardSub:    { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500', marginBottom: 14, marginTop: 4 },
  cta:        { borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 8 },
  ctaTxt:     { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#0A0A0F' },
  track:      { width: '100%', height: 6, backgroundColor: GREY2, borderRadius: 3, overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: 3 },
  procWrap:   { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 48 : 20 },
  procImg:    { width: W - 80, height: W * 0.55, borderRadius: 20, justifyContent: 'flex-end', alignItems: 'center', overflow: 'hidden', marginBottom: 20 },
  procOverlay:{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,8,12,0.6)', borderRadius: 20, borderWidth: 1.5 },
  procName:   { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  procTitle:  { color: TXTPRIM, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  procLabel:  { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  procPct:    { color: GREY1, fontSize: 13, fontWeight: '600', marginTop: 6, marginBottom: 16 },
  stepRow:    { flexDirection: 'row', marginBottom: 24 },
  stepItem:   { alignItems: 'center', marginHorizontal: 10 },
  stepDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: GREY2, marginBottom: 6 },
  stepLbl:    { color: GREY1, fontSize: 11, fontWeight: '600' },
  backBtn:    { marginTop: 8, padding: 12 },
  backTxt:    { color: GREY1, fontSize: 14, fontWeight: '600' },
  adBg:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  adBox:      { width: '100%', backgroundColor: SURFACE, borderRadius: 24, borderWidth: 1, padding: 28, alignItems: 'center' },
  adTitle:    { color: TXTPRIM, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  adSub:      { color: GREY1, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  adMock:     { width: '100%', height: 80, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: CARD },
  adMockTxt:  { color: GREY1, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  adMockSub:  { color: GREY2, fontSize: 10, marginTop: 4 },
  cdRing:     { width: 56, height: 56, borderRadius: 28, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cdNum:      { fontSize: 22, fontWeight: '900' },
  cdLabel:    { fontSize: 13, fontWeight: '600' },
  resWrap:    { alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 52 : 24 },
  badge:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 30, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 12 },
  badgeTxt:   { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  resTitle:   { color: TXTPRIM, fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginBottom: 16 },
  resImgWrap: { width: W - 40, height: W * 1.1, borderRadius: 20, borderWidth: 1.5, overflow: 'hidden', marginBottom: 16, elevation: 16 },
  resImg:     { width: '100%', height: '100%', justifyContent: 'flex-end' },
  watermark:  { backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 10, alignItems: 'center' },
  watermarkTxt:{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  statsRow:   { flexDirection: 'row', width: '100%', marginBottom: 16 },
  statBox:    { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: SURFACE, marginHorizontal: 4 },
  statVal:    { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  statLbl:    { color: GREY1, fontSize: 11, fontWeight: '500', marginTop: 2 },
  saveBtnWrap:{ width: '100%', marginBottom: 12 },
  saveBtn:    { width: '100%', borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 10 },
  saveTxt:    { color: '#0A0A0F', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  secRow:     { flexDirection: 'row', width: '100%', marginBottom: 8 },
  secBtn:     { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4 },
  secTxt:     { fontSize: 14, fontWeight: '700' },
  banner:     { width: '100%', height: 52, backgroundColor: '#1A1A28', borderTopWidth: 1, borderTopColor: BORDER, justifyContent: 'center', alignItems: 'center' },
  bannerTxt:  { color: GREY2, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
});
