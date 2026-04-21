import { UIModule } from "../../modules/ui-module";
import { GenericHelpers } from "./generic-helpers";
import type { Luigi } from "../../core-api/luigi";
import type LuigiContainer from "@luigi-project/container/LuigiContainer.svelte";

export type MicrofrontendEntry = {
    iframe: HTMLElement;
    id: string;
    active: boolean
};

export type MicrofrontendInDom = {
    container: HTMLElement;
    active: boolean;
    type: 'main' | 'modal' | 'drawer';
    id: string;
};

export const LuigiContainerHelpers = {
    getMicrofrontendsInDom(luigi: Luigi): MicrofrontendInDom[] {
        return [
            ...this.getMainMicrofrontends(luigi).map((mf) => ({
                container: mf.iframe,
                active: mf.active,
                type: 'main' as const,
                id: mf.id
            })),
            ...this.getModalMicrofrontends().map((mf) => ({
                container: mf.iframe,
                active: mf.active,
                type: 'modal' as const,
                id: mf.id
            })),
            ...(() => {
                const drawer = this.getDrawerMicrofrontends();
                if (!drawer.iframe) return [];
                return [{ container: drawer.iframe, active: drawer.active, type: 'drawer' as const, id: drawer.id }];
            })()
        ];
    },

    getMainMicrofrontends(luigi: Luigi): MicrofrontendEntry[] {
        const containerWrapper = luigi.getEngine()._connector?.getContainerWrapper();
        if (!containerWrapper) return [];
        const results: MicrofrontendEntry[] = [];
        for (const element of containerWrapper.childNodes as any) {
            if (!element.tagName?.startsWith('LUIGI-')) continue;
            if (element.iframeHandle?.iframe) {
                results.push({ iframe: element.iframeHandle.iframe, id: element.luigiMfId, active: GenericHelpers.isElementVisible(element) });
            } else {
                const webcomponent = element.shadowRoot?.firstElementChild?.firstElementChild ?? null;
                if (webcomponent) {
                    results.push({ iframe: webcomponent, id: element.luigiMfId, active: GenericHelpers.isElementVisible(element) });
                }
            }
        }
        return results;
    },

    getModalMicrofrontends(): MicrofrontendEntry[] {
        const results: MicrofrontendEntry[] = [];
        for (const element of UIModule.modalContainer as any) {
            if (element.iframeHandle?.iframe) {
                results.push({ iframe: element.iframeHandle.iframe, id: element.luigiMfId, active: GenericHelpers.isElementVisible(element) });
            } else {
                const webcomponent = element.shadowRoot?.firstElementChild?.firstElementChild ?? null;
                if (webcomponent) {
                    results.push({ iframe: webcomponent, id: element.luigiMfId, active: GenericHelpers.isElementVisible(element) });
                }
            }
        }
        return results;
    },

    getDrawerMicrofrontends(): MicrofrontendEntry {
        if (!UIModule.drawerContainer) return {} as MicrofrontendEntry;
        if (UIModule.drawerContainer.iframeHandle?.iframe) {
            return { iframe: UIModule.drawerContainer.iframeHandle.iframe, id: UIModule.drawerContainer.luigiMfId, active: GenericHelpers.isElementVisible(UIModule.drawerContainer) };
        } else {
            const webcomponent = UIModule.drawerContainer.shadowRoot?.firstElementChild?.firstElementChild ?? null;
            if (webcomponent) {
                return { iframe: webcomponent, id: UIModule.drawerContainer.luigiMfId, active: GenericHelpers.isElementVisible(UIModule.drawerContainer) };
            }
        }
        return {} as MicrofrontendEntry;
    },

    getAllLuigiContainerIframe(luigi: Luigi): LuigiContainer[] | undefined {
        const containerWrapper = luigi.getEngine()._connector?.getContainerWrapper();
        if (!containerWrapper) return undefined;
        const containers = [...containerWrapper.children].filter(
            element => element.tagName?.indexOf('LUIGI-CONTAINER') === 0 && (element as any).iframeHandle?.iframe
        ) as LuigiContainer[];
        for (const element of UIModule.modalContainer as any) {
            if (element.iframeHandle?.iframe) {
                containers.push(element as LuigiContainer);
            }
        }
        if (UIModule.drawerContainer) {
            if (UIModule.drawerContainer.iframeHandle?.iframe) {
                containers.push(UIModule.drawerContainer as LuigiContainer);
            }
        }
        return containers.length > 0 ? containers : undefined;
    }
}
