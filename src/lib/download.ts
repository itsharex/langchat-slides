import {formatDate} from '@vueuse/core';
import {snapdom} from '@zumer/snapdom';

/**
 * 下载 Blob 文件流
 * @param blobData - Blob 类型的文件数据
 * @param filename - 下载时的文件名（带扩展名）
 */
export function downloadBlob(blobData: Blob, filename: string) {
  const url = URL.createObjectURL(blobData);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url); // 释放内存
}

/**
 * 使用snapdom下载PNG图片
 */
export async function downloadPng(domId?: string, el?: HTMLElement) {
  const selector = domId ? document.getElementById(domId) : el;
  if (!selector) return;
  await snapdom.download(selector, {
    type: 'png',
    scale: 1,
    quality: 1,
    embedFonts: true,
    width: selector.scrollWidth + 100,
    filename: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    height: selector.scrollHeight,
  });
}

/**
 * 使用snapdom下载SVG图片
 */
export async function downloadSvg(domId?: string, el?: HTMLElement) {
  const selector = domId ? document.getElementById(domId) : el;
  if (!selector) return;
  await snapdom.download(selector, {
    type: 'svg',
    scale: 1,
    quality: 1,
    filename: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    embedFonts: true,
    height: selector.scrollHeight,
  });
}
