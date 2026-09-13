import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useColors } from '@/hooks/useColors';

type Phase = 'selection' | 'briefing' | 'tutorial' | 'mission' | 'victory';

type World = {
  id: string;
  name: string;
  type: string;
  species: string;
  ability: string;
  color: string;
};

const worlds: World[] = [
  { id: 'nyxara', name: 'Nyxara', type: 'Crystal Tides', species: 'Veyli', ability: 'Resonance pulse', color: '#2CE0C6' },
  { id: 'orvos', name: 'Orvos', type: 'Iron Canopy', species: 'Korr', ability: 'Stone shield', color: '#D5A553' },
  { id: 'thela', name: 'Thela', type: 'Living Ocean', species: 'Ariin', ability: 'Tidal dash', color: '#65B9F6' },
  { id: 'sath', name: 'Sath', type: 'Ash Moon', species: 'Sathen', ability: 'Ember coil', color: '#FF8A5B' },
  { id: 'eol', name: 'Eol', type: 'Cloud Archipelago', species: 'Myr', ability: 'Glide burst', color: '#D2B6FF' },
  { id: 'talun', name: 'Talun', type: 'Frozen Basin', species: 'Graal', ability: 'Frost field', color: '#B3E7EA' },
];

function OrbitalButton({
  world,
  active,
  onPress,
}: {
  world: World;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={`world-${world.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.worldOption,
        { borderColor: active ? world.color : colors.border, backgroundColor: active ? `${world.color}25` : colors.card, opacity: pressed ? 0.75 : 1 },
      ]}>
      <View style={[styles.orb, { backgroundColor: world.color }]} />
      <View style={styles.worldText}>
        <Text style={[styles.worldName, { color: colors.foreground }]}>{world.name}</Text>
        <Text style={[styles.worldType, { color: colors.mutedForeground }]}>{world.type}</Text>
      </View>
      {active ? <Feather name="check" size={18} color={world.color} /> : null}
    </Pressable>
  );
}

function HudCorner({ children, style }: { children: React.ReactNode; style?: object }) {
  const colors = useColors();
  return <View style={[styles.hudCorner, { borderColor: colors.border, backgroundColor: `${colors.background}D9` }, style]}>{children}</View>;
}

export default function AlienWorldDefense() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const stylesForTheme = useMemo(() => createStyles(colors), [colors]);
  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedWorld, setSelectedWorld] = useState<World>(worlds[0]);
  const [scans, setScans] = useState(0);
  const [defenders, setDefenders] = useState(100);
  const [enemies, setEnemies] = useState(3);
  const [controllerMode, setControllerMode] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [aim, setAim] = useState({ x: 0, y: 0 });
  const theme = useAudioPlayer(require('../assets/audio/alien-defense-theme.mp3'));
  const arrivalVoice = useAudioPlayer(require('../assets/audio/commander-arrival.mp3'));
  const shardVoice = useAudioPlayer(require('../assets/audio/commander-shard.mp3'));
  const energyPulse = useAudioPlayer(require('../assets/audio/energy-pulse.mp3'));

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    theme.loop = true;
    theme.volume = 0.18;
  }, [theme]);

  useEffect(() => {
    if (phase === 'briefing') {
      theme.play();
      arrivalVoice.seekTo(0);
      arrivalVoice.play();
    }
    if (phase === 'mission') {
      shardVoice.seekTo(0);
      shardVoice.play();
    }
  }, [arrivalVoice, phase, shardVoice, theme]);

  const movementResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setIsMoving(true),
      onPanResponderRelease: () => setIsMoving(false),
      onPanResponderTerminate: () => setIsMoving(false),
    }),
  ).current;

  const aimResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => setAim({ x: Math.max(-22, Math.min(22, gesture.dx / 9)), y: Math.max(-18, Math.min(18, gesture.dy / 9)) }),
      onPanResponderRelease: () => setAim({ x: 0, y: 0 }),
      onPanResponderTerminate: () => setAim({ x: 0, y: 0 }),
    }),
  ).current;

  const startDeployment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('briefing');
  };

  const scanBeacon = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScans((value) => Math.min(3, value + 1));
  };

  const firePulse = () => {
    if (enemies === 0) return;
    energyPulse.seekTo(0);
    energyPulse.play();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEnemies((value) => Math.max(0, value - 1));
    setDefenders((value) => Math.max(62, value - 7));
  };

  const completeTutorial = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('mission');
  };

  const contentTop = { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 12) };
  const contentBottom = { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 12) };

  if (phase === 'selection') {
    return (
      <ImageBackground source={require('../assets/images/six-worlds.jpg')} style={styles.fill} resizeMode="cover">
        <LinearGradient colors={[`${colors.background}E6`, `${colors.background}CC`, colors.background]} style={styles.fill}>
          <View style={[stylesForTheme.selection, contentTop, contentBottom]}>
            <View style={stylesForTheme.brandRow}>
              <View style={stylesForTheme.mark}><MaterialCommunityIcons name="orbit-variant" color={colors.primary} size={24} /></View>
              <View>
                <Text style={stylesForTheme.kicker}>DEFEND THE FIRST LIGHT</Text>
                <Text style={stylesForTheme.title}>ALIEN WORLD{"\n"}DEFENSE</Text>
              </View>
            </View>
            <View style={stylesForTheme.selectionGrid}>
              <View style={stylesForTheme.pickPanel}>
                <Text style={stylesForTheme.sectionLabel}>01 — HOMEWORLD</Text>
                <Text style={stylesForTheme.sectionTitle}>Choose where you stand.</Text>
                <View style={styles.worldList}>
                  {worlds.slice(0, 3).map((world) => <OrbitalButton key={world.id} world={world} active={world.id === selectedWorld.id} onPress={() => setSelectedWorld(world)} />)}
                </View>
              </View>
              <View style={stylesForTheme.centerPlanet}>
                <View style={[stylesForTheme.planet, { borderColor: selectedWorld.color }]}>
                  <View style={[stylesForTheme.planetCore, { backgroundColor: `${selectedWorld.color}50` }]} />
                </View>
                <Text style={stylesForTheme.planetName}>{selectedWorld.name.toUpperCase()}</Text>
                <Text style={stylesForTheme.planetMeta}>{selectedWorld.type} · Sector 06</Text>
              </View>
              <View style={stylesForTheme.pickPanel}>
                <Text style={stylesForTheme.sectionLabel}>02 — SPECIES</Text>
                <Text style={stylesForTheme.sectionTitle}>Choose your defender.</Text>
                <View style={styles.worldList}>
                  {worlds.slice(3).map((world) => <OrbitalButton key={world.id} world={world} active={world.id === selectedWorld.id} onPress={() => setSelectedWorld(world)} />)}
                </View>
              </View>
            </View>
            <View style={stylesForTheme.deployRow}>
              <View>
                <Text style={stylesForTheme.loadoutLabel}>OPERATIVE</Text>
                <Text style={stylesForTheme.loadout}>{selectedWorld.species} — {selectedWorld.ability}</Text>
              </View>
              <Pressable testID="begin-deployment" onPress={startDeployment} style={({ pressed }) => [stylesForTheme.deployButton, { opacity: pressed ? 0.78 : 1 }]}>
                <Text style={stylesForTheme.deployText}>BEGIN DEPLOYMENT</Text><Feather name="arrow-right" size={20} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  if (phase === 'briefing') {
    return (
      <ImageBackground source={require('../assets/images/nyxara-horizon.jpg')} style={styles.fill} resizeMode="cover">
        <LinearGradient colors={[`${colors.background}66`, `${colors.background}E8`]} style={styles.fill}>
          <View style={[stylesForTheme.cutscene, contentTop, contentBottom]}>
            <View style={stylesForTheme.cutsceneTop}>
              <Text style={stylesForTheme.kicker}>OPENING TRANSMISSION</Text>
              <Text style={stylesForTheme.sceneTag}>NYXARA · LUMEN VALLEY</Text>
            </View>
            <View style={stylesForTheme.dialogueBox}>
              <View style={stylesForTheme.speaker}>
                <View style={stylesForTheme.speakerSigil}><MaterialCommunityIcons name="crystal-ball" size={24} color={colors.primary} /></View>
                <View><Text style={stylesForTheme.speakerName}>COMMANDER AUREN</Text><Text style={stylesForTheme.speakerRole}>Veyli council signal</Text></View>
                <View style={stylesForTheme.voiceWave}><View style={stylesForTheme.wave} /><View style={stylesForTheme.waveTall} /><View style={stylesForTheme.wave} /></View>
              </View>
              <Text style={stylesForTheme.dialogue}>“Wake, defender. Your world has chosen you. The invaders are already in the valley.”</Text>
              <Pressable testID="continue-briefing" onPress={() => setPhase('tutorial')} style={stylesForTheme.continueButton}>
                <Text style={stylesForTheme.continueText}>ENTER THE VALLEY</Text><Feather name="chevron-right" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  const isTutorial = phase === 'tutorial';
  const objective = isTutorial
    ? scans < 3 ? `Locate resonance beacons · ${scans}/3` : 'Resonance route stable · unlock defense shard'
    : enemies > 0 ? `Repel landing unit · ${enemies} walkers active` : 'Lumen Valley secured';

  return (
    <ImageBackground source={require('../assets/images/nyxara-horizon.jpg')} style={styles.fill} resizeMode="cover">
      <LinearGradient colors={[`${colors.background}6B`, `${colors.background}62`, `${colors.background}B0`]} style={styles.fill}>
        <View style={[styles.fill, contentTop, contentBottom]}>
          <HudCorner style={styles.topLeft}>
            <View style={[stylesForTheme.healthBar, { width: 100 }]}><View style={[stylesForTheme.healthFill, { width: `${defenders}%` }]} /></View>
            <View><Text style={stylesForTheme.hudLabel}>VEYL SHIELD</Text><Text style={stylesForTheme.hudValue}>{defenders}%</Text></View>
          </HudCorner>
          <HudCorner style={styles.topRight}>
            <MaterialCommunityIcons name={isTutorial ? 'crystal-ball' : 'target'} size={20} color={colors.primary} />
            <View><Text style={stylesForTheme.hudLabel}>{isTutorial ? 'NON-LETHAL TRAINING' : 'HUMAN INCURSION'}</Text><Text style={stylesForTheme.objective}>{objective}</Text></View>
          </HudCorner>

          <View pointerEvents="none" style={[stylesForTheme.reticle, { transform: [{ translateX: aim.x }, { translateY: aim.y }] }]}>
            <View style={stylesForTheme.reticleCross} /><View style={stylesForTheme.reticleCenter} />
          </View>
          {isTutorial ? <View style={stylesForTheme.beaconLine}>
            {[0, 1, 2].map((item) => <View key={item} style={[stylesForTheme.beacon, { opacity: item < scans ? 1 : 0.42, borderColor: colors.primary }]}><MaterialCommunityIcons name="diamond-stone" color={colors.primary} size={26} /></View>)}
          </View> : <View style={stylesForTheme.enemyField}>
            {Array.from({ length: enemies }).map((_, index) => <View key={index} style={[stylesForTheme.enemy, { left: `${22 + index * 21}%`, top: `${12 + (index % 2) * 16}%` }]}><MaterialCommunityIcons name="robot-outline" size={32} color={colors.accent} /><Text style={stylesForTheme.enemyLabel}>M-0{index + 3}</Text></View>)}
          </View>}

          <View style={stylesForTheme.subtitle}><Text style={stylesForTheme.subtitleText}>{isTutorial ? 'AUREN: Move through the valley. Scan the three beacons; no weapons until the shard accepts you.' : enemies ? 'AUREN: Their armor has a blind angle. Release the resonance.' : 'AUREN: The first wave is broken. Nyxara still breathes.'}</Text></View>

          <View style={styles.bottomControls}>
            <View {...movementResponder.panHandlers} style={[stylesForTheme.joystick, isMoving && stylesForTheme.joystickActive]}>
              <View style={stylesForTheme.joystickRing}><View style={[stylesForTheme.joystickCore, isMoving && stylesForTheme.joystickCoreMoving]} /></View>
              <Text style={stylesForTheme.controlCaption}>MOVE</Text>
            </View>
            <View style={stylesForTheme.centerControls}>
              <Pressable testID="controller-mode" onPress={() => setControllerMode((value) => !value)} style={stylesForTheme.modeChip}>
                <MaterialCommunityIcons name="gamepad-variant-outline" size={18} color={controllerMode ? colors.primary : colors.mutedForeground} />
                <Text style={[stylesForTheme.modeText, { color: controllerMode ? colors.primary : colors.mutedForeground }]}>{controllerMode ? 'CONTROLLER MAP' : 'TOUCH MAP'}</Text>
              </Pressable>
              {controllerMode ? <Text style={stylesForTheme.mapHint}>Left stick move · Right stick aim · A action · RT pulse</Text> : <Text style={stylesForTheme.mapHint}>Drag left to move · Drag right to aim</Text>}
            </View>
            <View {...aimResponder.panHandlers} style={stylesForTheme.actionCluster}>
              {isTutorial ? <Pressable testID="scan-beacon" onPress={scans < 3 ? scanBeacon : completeTutorial} style={({ pressed }) => [stylesForTheme.actionButton, { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}>
                <MaterialCommunityIcons name={scans < 3 ? 'radar' : 'lock-open-variant'} size={33} color={colors.primaryForeground} />
                <Text style={[stylesForTheme.actionText, { color: colors.primaryForeground }]}>{scans < 3 ? 'SCAN' : 'UNLOCK'}</Text>
              </Pressable> : <Pressable testID="fire-pulse" onPress={firePulse} disabled={enemies === 0} style={({ pressed }) => [stylesForTheme.actionButton, { backgroundColor: colors.accent, opacity: enemies === 0 ? 0.45 : pressed ? 0.72 : 1 }]}>
                <MaterialCommunityIcons name="creation" size={33} color={colors.accentForeground} /><Text style={[stylesForTheme.actionText, { color: colors.accentForeground }]}>PULSE</Text>
              </Pressable>}
              <Text style={stylesForTheme.controlCaption}>AIM / ACTION</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  worldOption: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 9 },
  orb: { width: 20, height: 20, borderRadius: 10 },
  worldList: { gap: 8 },
  worldText: { flex: 1 },
  worldName: { fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  worldType: { fontSize: 11, marginTop: 1 },
  hudCorner: { position: 'absolute', zIndex: 4, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 13, padding: 9 },
  topLeft: { top: 10, left: 14 },
  topRight: { top: 10, right: 14, maxWidth: 340 },
  bottomControls: { position: 'absolute', bottom: 8, left: 14, right: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
});

function createStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    selection: { flex: 1, paddingHorizontal: 26, justifyContent: 'space-between' },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mark: { width: 47, height: 47, borderRadius: 16, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.primary}1E` },
    kicker: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 2.1 },
    title: { fontSize: 26, lineHeight: 27, color: colors.foreground, fontWeight: '800', letterSpacing: 1.2, marginTop: 3 },
    selectionGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30 },
    pickPanel: { width: 240, gap: 7 },
    sectionLabel: { color: colors.primary, fontSize: 10, letterSpacing: 1.7, fontWeight: '800' },
    sectionTitle: { color: colors.foreground, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    centerPlanet: { width: 210, alignItems: 'center', gap: 6 },
    planet: { width: 145, height: 145, borderRadius: 73, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.background}80` },
    planetCore: { width: 110, height: 110, borderRadius: 58, borderWidth: 1, borderColor: colors.foreground },
    planetName: { color: colors.foreground, fontSize: 16, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
    planetMeta: { color: colors.mutedForeground, fontSize: 11, letterSpacing: 0.6 },
    deployRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    loadoutLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    loadout: { color: colors.foreground, fontSize: 14, fontWeight: '700', marginTop: 3 },
    deployButton: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 13, backgroundColor: colors.primary },
    deployText: { color: colors.primaryForeground, fontWeight: '900', letterSpacing: 1, fontSize: 12 },
    cutscene: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
    cutsceneTop: { alignItems: 'center' },
    sceneTag: { color: colors.foreground, fontWeight: '700', marginTop: 6, letterSpacing: 1.2, fontSize: 12 },
    dialogueBox: { alignSelf: 'center', width: '82%', padding: 16, backgroundColor: `${colors.background}EC`, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
    speaker: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    speakerSigil: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.primary}1E`, borderColor: colors.primary, borderWidth: 1 },
    speakerName: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    speakerRole: { color: colors.mutedForeground, fontSize: 11, marginTop: 2 },
    voiceWave: { marginLeft: 'auto', flexDirection: 'row', gap: 3, alignItems: 'center' },
    wave: { width: 3, height: 10, backgroundColor: colors.primary, borderRadius: 3 },
    waveTall: { width: 3, height: 21, backgroundColor: colors.primary, borderRadius: 3 },
    dialogue: { color: colors.foreground, fontSize: 20, lineHeight: 29, fontWeight: '500', marginTop: 16, maxWidth: '85%' },
    continueButton: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
    continueText: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
    healthBar: { height: 5, borderRadius: 4, backgroundColor: colors.muted, overflow: 'hidden' },
    healthFill: { height: 5, borderRadius: 4, backgroundColor: colors.primary },
    hudLabel: { color: colors.mutedForeground, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
    hudValue: { color: colors.foreground, fontSize: 15, fontWeight: '900', marginTop: 1 },
    objective: { color: colors.foreground, fontSize: 12, fontWeight: '700', marginTop: 1 },
    reticle: { position: 'absolute', left: '50%', top: '45%', width: 46, height: 46, marginLeft: -23, marginTop: -23, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    reticleCross: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: `${colors.primary}AA` },
    reticleCenter: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    beaconLine: { position: 'absolute', top: '34%', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: '18%' },
    beacon: { alignItems: 'center', justifyContent: 'center', width: 55, height: 55, borderRadius: 28, backgroundColor: `${colors.background}8A`, borderWidth: 1 },
    enemyField: { position: 'absolute', top: '29%', left: 0, right: 0, height: 160 },
    enemy: { position: 'absolute', alignItems: 'center', padding: 6, backgroundColor: `${colors.background}B3`, borderRadius: 9, borderWidth: 1, borderColor: `${colors.accent}88` },
    enemyLabel: { color: colors.accent, fontSize: 9, letterSpacing: 1, fontWeight: '800' },
    subtitle: { position: 'absolute', bottom: 105, alignSelf: 'center', width: '58%', borderLeftWidth: 2, borderColor: colors.primary, paddingLeft: 10 },
    subtitleText: { color: colors.foreground, fontSize: 12, lineHeight: 17, textAlign: 'center', textShadowColor: colors.background, textShadowRadius: 6 },
    joystick: { alignItems: 'center', gap: 3 },
    joystickActive: { opacity: 0.8 },
    joystickRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: `${colors.foreground}80`, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.background}70` },
    joystickCore: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
    joystickCoreMoving: { backgroundColor: colors.primary },
    controlCaption: { color: colors.mutedForeground, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
    centerControls: { alignItems: 'center', paddingBottom: 18 },
    modeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 12, backgroundColor: `${colors.background}C0`, borderWidth: 1, borderColor: colors.border },
    modeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
    mapHint: { color: colors.foreground, fontSize: 10, marginTop: 5, textShadowColor: colors.background, textShadowRadius: 4 },
    actionCluster: { alignItems: 'center', gap: 3 },
    actionButton: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: `${colors.foreground}90` },
    actionText: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 1 },
  });
}