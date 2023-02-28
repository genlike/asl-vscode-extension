import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject,
    LangiumServices, LangiumSharedServices, Module, PartialLangiumServices
} from 'langium';
import { AslGeneratedModule, AslGeneratedSharedModule } from './generated/module';
import { AslValidator, registerValidationChecks } from './asl-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type AslAddedServices = {
    validation: {
        AslValidator: AslValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type AslServices = LangiumServices & AslAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const AslModule: Module<AslServices, PartialLangiumServices & AslAddedServices> = {
    validation: {
        AslValidator: () => new AslValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createAslServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Asl: AslServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        AslGeneratedSharedModule
    );
    const Asl = inject(
        createDefaultModule({ shared }),
        AslGeneratedModule,
        AslModule
    );
    shared.ServiceRegistry.register(Asl);
    registerValidationChecks(Asl);
    return { shared, Asl };
}
