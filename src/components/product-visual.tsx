import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Product } from '../lib/products';
import { useProductImage, type ProductImage } from '../lib/product-photos';
import { position, productImageKey, siteImage, STAND_INS, type ImageWidth } from '../lib/site-content';
import { colors, fonts, type } from '../lib/theme';

// A product's image, in the website's order of preference (components/shop/ProductVisual.tsx):
//   1. the real product photo, once the owner adds it to the website (lib/product-photos.ts)
//   2. the licensed stand-in photo
//   3. a typographic label, for a new product with neither yet
// Same 4:5 crop and rounded corners as the website. Images load from the website.
// Pass `image` when the caller already looked it up (it needs to know which one is shown).
export function ProductVisual({ product, tint, width = 384, large = false, image }: { product: Product; tint: string; width?: ImageWidth; large?: boolean; image?: ProductImage }) {
  const own = useProductImage(product.name);
  const shown = image ?? own;
  const standIn = STAND_INS[productImageKey(product.name)];
  const [boxWidth, setBoxWidth] = useState(0);
  const soldOut = !product.available;

  const alt =
    shown.kind === 'photo'
      ? product.name
      : standIn?.kind === 'snack'
        ? `Stand-in photo of ${standIn.shows} — not Igbadun Bites’ own product`
        : `Ingredient photo: ${standIn?.shows} (not the finished ${product.name})`;

  return (
    <View style={[styles.frame, { backgroundColor: tint }, soldOut && styles.soldOut]} onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}>
      {shown.kind === 'pending' ? null : shown.kind !== 'label' ? (
        <Image
          source={{ uri: siteImage(shown.path, width) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={shown.kind === 'stand-in' ? position(standIn?.position) : 'center'}
          transition={200}
          accessible
          accessibilityLabel={alt}
          onError={shown.onError}
        />
      ) : (
        // Typographic label (sized to the box like the website's container-query units)
        <View style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text style={[type.eyebrow, styles.labelPack, { top: boxWidth * 0.07, left: boxWidth * 0.07 }]}>{product.pack_size}</Text>
          <Text
            style={[styles.labelName, { left: boxWidth * 0.06, right: -boxWidth * 0.06, bottom: boxWidth * 0.03, fontSize: boxWidth * (large ? 0.22 : 0.24), lineHeight: boxWidth * (large ? 0.22 : 0.24) * 0.9 }]}
          >
            {product.name}
          </Text>
        </View>
      )}
      {soldOut && (
        <View style={styles.soldOutPill}>
          <Text style={[type.eyebrow, { color: colors.cocoa }]}>Sold out</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { aspectRatio: 4 / 5, borderRadius: 8, overflow: 'hidden' },
  soldOut: { opacity: 0.7 },
  labelPack: { position: 'absolute', color: colors.cocoaSoft },
  labelName: { position: 'absolute', fontFamily: fonts.serifItalic, color: 'rgba(43,26,18,0.9)', letterSpacing: -1 },
  soldOutPill: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.oat },
});
