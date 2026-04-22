import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import { GEMINI_API_KEY } from '@env';
import { styles } from '../styles';
import { theme } from '../theme';
import { Header, CustomButton } from '../components';
import { callGeminiAPI } from '../api/gemini';
import { CommonScreenProps, ScannedItem } from '../types';

type Props = CommonScreenProps & {
  setScannedItem: (item: ScannedItem | null) => void;
};

export const ScanScreen: React.FC<Props> = ({
  setScreen,
  setScannedItem,
  userPrefs,
  healthHistory,
  userId,
  db,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [imageAssets, setImageAssets] = useState<Asset[]>([]);

  const analyzeImages = async (assets: Asset[]) => {
    if (!userId || !db) {
      setStatus('Error: Not logged in.');
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setStatus('Preparing images...');

    const apiKey = GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt =
      'Extract all text from these food package labels. Focus on ingredients, nutritional facts, brand name, weight, dates, and warnings.';

    const imageParts = assets.map(asset => ({
      inlineData: {
        mimeType: asset.type || 'image/jpeg',
        data: asset.base64 || '',
      },
    }));

    if (imageParts.some(p => !p.inlineData.data)) {
      setStatus('Error: Failed to read image data.');
      setIsLoading(false);
      return;
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
    };

    try {
      setStatus('Reading images with AI...');
      setProgress(25);

      let response: Response | undefined;
      let delay = 1000;
      for (let i = 0; i < 3; i++) {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setProgress(50);
          break;
        }
        if (response.status === 429 || response.status >= 500) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        } else throw new Error(`Vision API failed: ${response.status}`);
      }
      if (!response || !response.ok)
        throw new Error('Vision API failed after retries');

      const result = await response.json();
      const combinedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!combinedText?.trim())
        throw new Error('No text found in the images.');

      setProgress(75);
      setStatus('Analyzing nutrition...');
      const analysisResult = await callGeminiAPI(
        combinedText,
        userPrefs,
        healthHistory,
      );

      setProgress(100);
      setStatus('Analysis Complete!');
      setScannedItem(analysisResult as ScannedItem);
      setScreen('Analysis');
      setImageAssets([]);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 5 - imageAssets.length,
        includeBase64: true,
      },
      (response: ImagePickerResponse) => {
        if (response.errorCode) setStatus(`Error: ${response.errorMessage}`);
        else if (response.assets)
          setImageAssets(prev => [...prev, ...response.assets!].slice(0, 5));
      },
    );
  };

  const handleCameraLaunch = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
        saveToPhotos: false,
      },
      (response: ImagePickerResponse) => {
        if (response.errorCode) setStatus(`Error: ${response.errorMessage}`);
        else if (response.assets)
          setImageAssets(prev => [...prev, ...response.assets!].slice(0, 5));
      },
    );
  };

  const removeImage = (index: number) =>
    setImageAssets(prev => prev.filter((_, i) => i !== index));

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header title="Scan Label" onBack={() => setScreen('Home')} />
      <ScrollView contentContainerStyle={styles.contentScrollableCenter}>
        {isLoading ? (
          <View style={styles.centeredContent}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
            <Text style={[styles.description, { marginTop: 20 }]}>
              {status}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text>{progress}%</Text>
          </View>
        ) : (
          <>
            <Text style={styles.description}>
              Upload one or more images (max 5) of a food label.
            </Text>
            <View style={styles.imagePreviewGrid}>
              {imageAssets.map((asset, index) => (
                <View
                  key={asset.uri || index}
                  style={styles.thumbnailContainer}
                >
                  <Image source={{ uri: asset.uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeImageBtn}
                  >
                    <Text style={styles.removeImageBtnText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <CustomButton
              title={
                imageAssets.length < 5
                  ? 'Add from Library'
                  : 'Max Images Reached'
              }
              onPress={handleImageUpload}
              disabled={imageAssets.length >= 5}
              icon="📁"
            />
            <CustomButton
              title={
                imageAssets.length < 5 ? 'Take Photo' : 'Max Images Reached'
              }
              onPress={handleCameraLaunch}
              disabled={imageAssets.length >= 5}
              icon="📷"
              secondary
              style={{ marginTop: 10 }}
            />
            {imageAssets.length > 0 && (
              <CustomButton
                title={`Analyze ${imageAssets.length} Image(s)`}
                onPress={() => analyzeImages(imageAssets)}
                style={{ marginTop: 20, backgroundColor: theme.primaryDark }}
              />
            )}
            {status.startsWith('Error') && (
              <Text style={[styles.errorMessage, { marginTop: 15 }]}>
                {status}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
