import React, { useState, useEffect } from 'react';
import type { ExpertProfile, ExpertProduct } from '../types';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { CubeIcon } from './icons/CubeIcon';
import { ActionToolbar } from './ActionToolbar';
import { translations } from '../lib/translations';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface CardProps {
  profile: ExpertProfile;
  isEditable?: boolean;
  onUpdate?: (updatedProfile: ExpertProfile) => void;
  t: (key: keyof typeof translations) => string;
}

const ServicesCard: React.FC<CardProps> = ({ profile, isEditable = false, onUpdate, t }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableServices, setEditableServices] = useState(profile.services || []);
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);

    useEffect(() => {
        setEditableServices(profile.services || []);
    }, [profile.services]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({ ...profile, services: editableServices.filter(s => s.trim() !== '') });
        }
        setIsEditing(false);
        setShowSaveFeedback(true);
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleCancel = () => {
        setEditableServices(profile.services || []);
        setIsEditing(false);
    };

    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...editableServices];
        newServices[index] = value;
        setEditableServices(newServices);
    };
    
    const addService = () => setEditableServices(prev => [...prev, '']);
    const removeService = (index: number) => setEditableServices(prev => prev.filter((_, i) => i !== index));

    return (
        <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] animate-fade-in relative">
            <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-lg font-semibold text-[var(--text-color)] flex items-center">
                    <WrenchScrewdriverIcon className="w-5 h-5 mr-2 rtl:ml-2 text-[var(--primary-color)] dark:text-[var(--primary-color-light)]" />
                    {t('suggestedServices')}
                </h4>
                <div className="flex items-center gap-2">
                    {showSaveFeedback && (
                        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full animate-fade-in">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{t('saved')}</span>
                        </div>
                    )}
                  {!isEditing && <ActionToolbar content={profile.services || []} type="services" title={t('suggestedServices')} t={t} />}
                  {isEditable && !isEditing && (
                       <button onClick={() => setIsEditing(true)} title={t('edit')} className="p-2.5 rounded-lg bg-[var(--button-muted-background)] text-[var(--text-muted-color)] hover:bg-[var(--button-muted-hover-background)] transition">
                          <EditIcon className="w-5 h-5" />
                      </button>
                  )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    {(editableServices).map((service, index) => (
                         <div key={index} className="flex items-center gap-2">
                            <input 
                                type="text"
                                value={service}
                                placeholder={t('servicePlaceholder')}
                                onChange={(e) => handleServiceChange(index, e.target.value)}
                                className="w-full p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)]"
                            />
                            <button onClick={() => removeService(index)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full shrink-0">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    <button onClick={addService} className="flex items-center text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:text-[var(--primary-color-hover)]">
                        <PlusCircleIcon className="w-5 h-5 mr-1" />
                        {t('addService')}
                    </button>
                </div>
            ) : (
                <ul className="space-y-2 list-disc list-inside text-[var(--text-muted-color)]">
                    {(profile.services || []).map((service, index) => <li key={index}>{service}</li>)}
                </ul>
            )}

            {isEditing && (
                <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border-muted-color)] pt-4">
                    <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition">
                        <XIcon className="w-5 h-5 mr-1" />
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-lg hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all">
                        <CheckIcon className="w-5 h-5 mr-1" />
                        {t('saveChanges')}
                    </button>
                </div>
            )}
        </div>
    );
};

const ProductsCard: React.FC<CardProps> = ({ profile, isEditable = false, onUpdate, t }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableProducts, setEditableProducts] = useState(profile.products || []);
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);

    useEffect(() => {
        setEditableProducts(profile.products || []);
    }, [profile.products]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({ ...profile, products: editableProducts.filter(p => p.name.trim() !== '') });
        }
        setIsEditing(false);
        setShowSaveFeedback(true);
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleCancel = () => {
        setEditableProducts(profile.products || []);
        setIsEditing(false);
    };

    const handleProductChange = (index: number, field: keyof ExpertProduct, value: string) => {
        const newProducts = [...editableProducts];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setEditableProducts(newProducts);
    };

    const addProduct = () => setEditableProducts(p => [...p, { name: '', type: '', description: '', price: ''}]);
    const removeProduct = (index: number) => setEditableProducts(p => p.filter((_, i) => i !== index));

    return (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-emerald-500/20 animate-fade-in relative">
            <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-lg font-semibold text-[var(--text-color)] flex items-center">
                    <CubeIcon className="w-5 h-5 mr-2 rtl:ml-2 text-emerald-600 dark:text-emerald-400" />
                    {t('suggestedProducts')}
                </h4>
                 <div className="flex items-center gap-2">
                    {showSaveFeedback && (
                        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full animate-fade-in">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{t('saved')}</span>
                        </div>
                    )}
                  {!isEditing && <ActionToolbar content={profile.products || []} type="products" title={t('suggestedProducts')} t={t} />}
                  {isEditable && !isEditing && (
                       <button onClick={() => setIsEditing(true)} title={t('edit')} className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-400/10 hover:bg-emerald-500/20 transition">
                          <EditIcon className="w-5 h-5" />
                      </button>
                  )}
                </div>
            </div>

            <div className="space-y-4">
                {(isEditing ? editableProducts : profile.products || []).map((product, index) => (
                    <div key={index} className="bg-white/70 dark:bg-emerald-900/50 p-4 rounded-lg shadow-sm">
                        {isEditing ? (
                            <div className="space-y-2">
                                 <div className="flex items-center gap-2">
                                    <input type="text" placeholder={t('productName')} value={product.name} onChange={e => handleProductChange(index, 'name', e.target.value)} className="w-full p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] font-semibold"/>
                                    <button onClick={() => removeProduct(index)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full shrink-0">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder={t('productType')} value={product.type} onChange={e => handleProductChange(index, 'type', e.target.value)} className="w-1/2 p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)]"/>
                                    <input type="text" placeholder={t('productPrice')} value={product.price || ''} onChange={e => handleProductChange(index, 'price', e.target.value)} className="w-1/2 p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)]"/>
                                </div>
                                <textarea placeholder={t('productDescription')} value={product.description} onChange={e => handleProductChange(index, 'description', e.target.value)} className="w-full p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)]" rows={2}/>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-baseline">
                                    <h5 className="font-bold text-[var(--text-color)]">{product.name}</h5>
                                    {product.price && <span className="text-sm font-semibold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">{(product.price?.includes('يحدد') || product.price?.toLowerCase().includes('to be determined')) ? '🔜' : product.price}</span>}
                                </div>
                                <p className="text-xs text-[var(--text-muted-color)] mb-1">{product.type}</p>
                                <p className="text-sm text-[var(--text-color)]">{product.description}</p>
                            </>
                        )}
                    </div>
                ))}
                 {isEditing && (
                    <button onClick={addProduct} className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                        <PlusCircleIcon className="w-5 h-5 mr-1" />
                        {t('addProduct')}
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="mt-6 flex justify-end gap-3 border-t border-emerald-500/20 pt-4">
                    <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition">
                        <XIcon className="w-5 h-5 mr-1" />
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all">
                        <CheckIcon className="w-5 h-5 mr-1" />
                        {t('saveChanges')}
                    </button>
                </div>
            )}
        </div>
    );
};


interface ExpertExtrasSectionProps {
  profile: ExpertProfile;
  isEditable?: boolean;
  onUpdate?: (updatedProfile: ExpertProfile) => void;
  t: (key: keyof typeof translations) => string;
}

export const ExpertExtrasSection: React.FC<ExpertExtrasSectionProps> = (props) => {
  return (
    <>
      <ServicesCard {...props} />
      <ProductsCard {...props} />
    </>
  );
};