import { StyleSheet, Platform } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  mobileFrame: { flex: 1, backgroundColor: theme.backgroundLight },
  screenContainer: { flex: 1, backgroundColor: theme.backgroundLight },
  screenContainerWithNav: { flex: 1, backgroundColor: theme.backgroundLight },
  screenContainerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.backgroundLight,
  },
  content: { padding: 20, flex: 1 },
  contentScrollable: { padding: 20 },
  contentScrollableCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Typography
  logo: {
    fontSize: 38,
    fontWeight: 'bold',
    color: theme.primaryDark,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textDark,
    marginBottom: 10,
    marginTop: 10,
  },
  subtitle: { fontSize: 18, color: theme.textLight, marginBottom: 20 },
  description: {
    fontSize: 16,
    color: theme.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textDark,
    marginTop: 20,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.textDark,
    marginBottom: 6,
    fontWeight: '500',
  },

  // Inputs
  input: {
    backgroundColor: theme.backgroundWhite,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.textDark,
    borderWidth: 1,
    borderColor: theme.borderColor,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: theme.backgroundWhite,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.textDark,
    borderWidth: 1,
    borderColor: theme.borderColor,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },

  // Dashboard / Home
  dashboard: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricBox: {
    flex: 1,
    backgroundColor: theme.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  metricValue: { fontSize: 32, fontWeight: 'bold', color: theme.primaryDark },
  metricValueWarning: { color: theme.errorColor },
  metricLabel: {
    fontSize: 13,
    color: theme.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  mainActions: { gap: 12 },
  scanButton: { backgroundColor: theme.primaryDark },

  // Preferences
  preferenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  preferenceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.borderColor,
    backgroundColor: theme.backgroundWhite,
  },
  preferenceChipSelected: {
    borderColor: theme.primaryColor,
    backgroundColor: '#e8f8f0',
  },
  preferenceChipText: { fontSize: 15, color: theme.textLight },
  preferenceChipTextSelected: { color: theme.primaryDark, fontWeight: '600' },
  goalInputGrid: { flexDirection: 'row', gap: 12 },

  // Cards / Layout
  card: {
    backgroundColor: theme.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  warningCard: {
    backgroundColor: '#fffbe6',
    borderColor: theme.warningColor,
    borderWidth: 1,
  },
  warningCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d35400',
    marginBottom: 10,
  },
  notificationBar: { padding: 12, borderRadius: 12, marginBottom: 15 },
  notificationWarning: {
    backgroundColor: '#fffbe6',
    borderColor: theme.warningColor,
    borderWidth: 1,
  },
  notificationWarningText: {
    color: '#d35400',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Rating circle
  ratingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  ratingText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  ratingSubtext: { fontSize: 14, color: '#fff' },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  indicator_good: { backgroundColor: theme.successColor },
  indicator_neutral: { backgroundColor: theme.warningColor },
  indicator_bad: { backgroundColor: theme.errorColor },
  ingredientName: { fontSize: 16, fontWeight: '500', color: theme.textDark },
  ingredientAnalysis: { fontSize: 14, color: theme.textLight, marginTop: 4 },
  alternativeItem: { fontSize: 16, color: theme.textDark, paddingVertical: 4 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: theme.backgroundWhite,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: theme.textDark,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e0e6ed',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontWeight: '600', color: theme.textLight },
  tabActive: {
    backgroundColor: theme.backgroundWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  tabTextActive: { color: theme.primaryDark },

  // Messages
  errorMessage: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: theme.errorColor,
  },
  successMessage: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: theme.successColor,
    fontWeight: '600',
  },
  centeredText: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: theme.textLight,
  },

  // Progress bar
  progressBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#e0e6ed',
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: theme.primaryColor },

  // Nutrition grid
  nutritionGrid: { gap: 12 },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  nutritionItemFull: { paddingBottom: 12 },
  nutritionLabel: { fontSize: 15, color: theme.textLight },
  nutritionValue: { fontSize: 15, fontWeight: '600', color: theme.textDark },

  // Warnings list
  warningsList: { paddingLeft: 5, marginTop: 8 },
  warningsListItem: { fontSize: 15, color: theme.textDark, marginBottom: 5 },
  ingredientListText: { fontSize: 14, color: theme.textLight, lineHeight: 22 },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  toggleLabel: { fontSize: 14, color: theme.textDark, fontWeight: '500' },

  // Log items
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  logItemHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logItemName: {
    fontWeight: 'bold',
    color: theme.textDark,
    fontSize: 16,
    flexShrink: 1,
    marginRight: 10,
  },
  logItemTime: { fontSize: 12, color: theme.textLight },
  logItemCalories: { fontSize: 16, fontWeight: '600', color: theme.textDark },
  logItemDetails: { paddingHorizontal: 16, paddingBottom: 16 },

  // Fruit/veg search
  fruitVegSearchContainer: { position: 'relative', zIndex: 10 },
  fruitVegResultsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.backgroundWhite,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    zIndex: 10,
    marginTop: -16,
    paddingTop: 16,
  },
  fruitVegResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  selectedItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textDark,
    flex: 1,
    marginRight: 10,
  },
  selectedItemQuantity: {
    width: 70,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    textAlign: 'right',
    fontSize: 16,
    color: theme.textDark,
  },
  removeItemButton: {
    color: theme.errorColor,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    padding: 5,
  },

  // Weekly totals
  weeklyTotalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: theme.borderColor,
    paddingBottom: 8,
    marginBottom: 8,
  },
  weeklyTotalHeaderText: {
    fontSize: 15,
    color: theme.textLight,
    fontWeight: '600',
  },

  // Image preview
  imagePreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Feedback (RL)
  choiceAlternatives: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textDark,
  },
  choiceCalories: { fontSize: 13, color: theme.textLight, marginTop: 3 },
  feedbackContainer: { flexDirection: 'row', gap: 10 },

  // Header (used in components/index too, but kept here for global access)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    height: Platform.OS === 'android' ? 60 : 50,
    backgroundColor: theme.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: theme.textDark },
  headerNav: { width: 44, alignItems: 'center' },
  headerButton: { padding: 8 },
  headerButtonText: { fontSize: 28, color: theme.textDark, fontWeight: '600' },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: theme.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
  },
  navButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 22, color: theme.textLight },
  navLabel: { fontSize: 10, color: theme.textLight, marginTop: 2 },
  navTextActive: { color: theme.primaryColor },

  // Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: theme.backgroundWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  menuButtonText: { fontSize: 17, color: theme.textDark },
  menuButtonActive: { color: theme.primaryColor, fontWeight: '600' },

  // Buttons (duplicated from components/index for global sheet access)
  button: {
    backgroundColor: theme.primaryColor,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.primaryColor,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButtonText: { color: theme.primaryColor },
  buttonIcon: { fontSize: 18, marginRight: 8 },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.primaryColor,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: theme.primaryColor },
  checkboxCheck: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  checkboxLabel: { fontSize: 16, color: theme.textDark },

  // metricValueWarning already defined above
});
