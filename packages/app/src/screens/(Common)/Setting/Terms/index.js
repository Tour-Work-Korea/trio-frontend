import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

import Header from '@components/Header';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const Terms = () => {
  const {t} = useTranslation();
  return (
    <View style={{flex: 1, backgroundColor: COLORS.grayscale_100}}>
      <Header title={t('settings.termsOfUse_3b9e30')} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingVertical: 16}}>
        <View style={styles.menuContainer}>
          <Text style={[styles.h2, {marginTop: 16}]}>
            {t(
              'settings.chapter2EstablishmentOfServiceAgreementAndRightsAndObligations',
            )}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article5EstablishmentOfUseAgreement')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanySServiceUseAgreementHereinafterReferredToAs',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.inTheApplicationInThePrecedingParagraphTheCompanyMay')}
          </Text>

          <Text style={styles.h3}>
            {t(
              'settings.article6ApprovalAndRestrictionsOnApplicationForMembership',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyMayRefuseToAcceptAnApplicationForMembership',
            )}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.1IfMemberInformationIsFalselyEnteredOmittedOrContains',
            )}
          </Text>
          <Text style={styles.li}>
            {t('settings.2WhenPersonalInformationSuchAsAnotherPersonSName')}
          </Text>
          <Text style={styles.li}>
            {t('settings.3IfTheApplicationIsMadeInViolationOfRelevant')}
          </Text>
          <Text style={styles.li}>
            {t('settings.4IfYouHaveLostYourMembershipWithin5Years')}
          </Text>
          <Text style={styles.li}>
            {t('settings.5IfTheMemberInformationIsTheSameAsThat')}
          </Text>
          <Text style={styles.li}>
            {t('settings.6WhenAChildUnderTheAgeOf14Applies')}
          </Text>
          <Text style={styles.p}>
            {t('settings.inAnyOfTheFollowingCasesTheCompanyMayWithhold')}
          </Text>
          <Text style={styles.li}>
            {t('settings.1WhenThereIsNoRealisticRoomForTheCompany')}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.2IfThereAreTechnicalDifficultiesInProvidingTheService',
            )}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.3WhenRealNameVerificationAndIdentityVerificationProceduresAre',
            )}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article7ManagementOfMemberInformation')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.membersCanViewAndEditPersonalInformationThroughTheInformation',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.ifTheRegisteredMemberInformationChangesTheMemberMustEdit',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.theMemberSResumeWillBeRegisteredAndProvidedIn')}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article8CollectionAndProtectionOfMemberInformation')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.whenProvidingServicesTheCompanyCompliesWithLawsRelatedTo',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.inAdditionToTheInformationDirectlyProvidedByMembersThe',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyStrivesToProtectMembersPersonalInformationInAccordance',
            )}
          </Text>

          <Text style={styles.h2}>{t('settings.chapter3UseOfServices')}</Text>

          <Text style={styles.h3}>{t('settings.article9UseOfService')}</Text>
          {/* 원문에 구체 내용이 없는 조항은 제목만 표기 */}

          <Text style={styles.h3}>
            {t('settings.article10ContentsOfService')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyProvidesTheServicesStipulatedInArticle2Paragraph',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyMayAddOrChangeTheContentsOfThe')}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyMaySuspendAllOrPartOfTheServices')}
          </Text>
          <Text style={styles.p}>
            {t('settings.inTheCaseOfParagraphs2And3TheCompany')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.detailedGuidanceOrInformationRegardingTheUseOfTheService',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.ifAllOrPartOfTheServiceIsTerminatedOr')}
          </Text>
          <Text style={styles.li}>
            {t('settings.1IfThereAreSeparateProvisionsInRelevantLawsOr')}
          </Text>
          <Text style={styles.li}>
            {t('settings.2IfAReservationMadeBeforeTheEndOfThe')}
          </Text>

          <Text style={styles.h3}>{t('settings.article11ServiceFees')}</Text>
          {/* 내용 생략(원문 구조 유지) */}

          <Text style={styles.h3}>
            {t('settings.article12ChangeAndSuspensionOfService')}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyMayNotifyTheContentsOfTheServiceTo')}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyMaySuspendAllOrPartOfTheService')}
          </Text>
          <Text style={styles.li}>
            {t('settings.1WhenNecessaryForSystemOperationSuchAsRegularSystem')}
          </Text>
          <Text style={styles.li}>
            {t('settings.2InCasesWhereNormalProvisionIsDifficultSuchAs')}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.3ForceMajeureSuchAsNaturalDisasterNationalEmergencyEtc',
            )}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.4WhenContinuationIsDeemedInappropriateForOtherSeriousReasons',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.ifTheServiceIsSuspendedPursuantToThePrecedingParagraph',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyIsNotResponsibleForAnyProblemsCausedBy')}
          </Text>

          <Text style={styles.h3}>
            {t(
              'settings.article13ProvisionOfInformationAndPostingOfAdvertisements',
            )}
          </Text>
          {/* 내용 생략 */}

          <Text style={styles.h3}>
            {t('settings.article14AttributionOfRights')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.copyrightAndIntellectualPropertyRightsForTheServiceBelongTo',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyOwnsOrHasTheRightToUseAll')}
          </Text>
          <Text style={styles.p}>
            {t('settings.usersMayBeHeldLiableIfTheyUseTheInformation')}
          </Text>

          <Text style={styles.h2}>
            {t('settings.chapter4ObligationsOfTheCompanyAndUsers')}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article15ObligationsOfTheCompany')}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyDoesNotEngageInAnyActsProhibitedBy')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyHasASystemForPersonalInformationProtectionComplies',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.ifLegitimateOpinionsAreReceivedFromUsersNecessaryMeasuresWill',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.theCompanyIsLiableOnlyIfDamageOccursToThe')}
          </Text>
          <Text style={styles.p}>
            {t('settings.ifADisputeArisesBetweenUsersWeWillTakeAction')}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article16UserObligations')}
          </Text>
          <Text style={styles.p}>
            {t('settings.membersMustComplyWithTheLawsTheseTermsAndConditions')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.youMustCheckTheDetailsAndTransactionConditionsBeforePayment',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.membersAreResponsibleForPreventingLossOfInformationSuchAs',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.theRightToUseTheServiceOrStatusCannotBe')}
          </Text>
          <Text style={styles.p}>
            {t('settings.membersMustNotEngageInAnyOfTheFollowingActs')}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.1EnteringOrTransmittingFalseInformationDuringIdentityVerificationEtc',
            )}
          </Text>
          <Text style={styles.li}>
            {t('settings.2UsingTheServiceByStealingOtherPeopleSInformation')}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.3IntentionallyCuttingOffContactWithTheCompanyAndGuesthouse',
            )}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.4CollectingStoringAndDisclosingOtherPeopleSPersonalInformation',
            )}
          </Text>
          <Text style={styles.li}>
            {t('settings.5ActivitiesAimedAtOrRelatedToCrime')}
          </Text>
          <Text style={styles.li}>
            {t('settings.6ActsThatDefameOrInsultOtherMembersReputation')}
          </Text>
          <Text style={styles.li}>
            {t('settings.7ActsThatInfringeOnTheCompanySIntellectualProperty')}
          </Text>
          <Text style={styles.li}>
            {t('settings.8HackingOrSpreadingViruses')}
          </Text>
          <Text style={styles.li}>
            {t('settings.9ActionsThatInterfereWithTheStableOperationOfThe')}
          </Text>
          <Text style={styles.li}>
            {t(
              'settings.10CommercialActivitiesUsingSiteInformationAndServices',
            )}
          </Text>
          <Text style={styles.li}>
            {t('settings.11ImpersonatingACompanyEmployeeManagerOrOperator')}
          </Text>
          <Text style={styles.li}>
            {t('settings.12HarmingOtherGoodMoralsAndSocialOrderOrViolating')}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article17TerminationOfServiceUse')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.membersCanApplyForCancellationAccordingToTheCancellationMethod',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.whenACancellationRequestIsReceivedTheCompanyTerminatesThe',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.membersMustCompleteAllReservationsAndUsageBeforeApplyingFor',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyMayTerminateTheServiceAgreementOrDeleteResumes',
            )}
          </Text>
          <Text style={styles.li}>
            {t('settings.1FailureToFulfillMemberObligations')}
          </Text>
          <Text style={styles.li}>
            {t('settings.2NonPaymentOfPaidServiceFees')}
          </Text>
          <Text style={styles.li}>
            {t('settings.3SocialProblemsAriseDueToTheUseOfInformation')}
          </Text>
          <Text style={styles.li}>
            {t('settings.4IfTheRegistrationInformationIsDifferentFromTheFacts')}
          </Text>
          <Text style={styles.li}>
            {t('settings.5InCaseOfDefamationOfTheCompanyOrA')}
          </Text>
          <Text style={styles.li}>
            {t('settings.6OtherReasonsCorrespondingToTheAboveItems')}
          </Text>
          <Text style={styles.li}>
            {t('settings.7InCaseOfFalseInformationOrUseOfAnother')}
          </Text>
          <Text style={styles.li}>
            {t('settings.8IfInformationIsConfirmedToBeOfAChild')}
          </Text>
          <Text style={styles.p}>
            {t('settings.uponTerminationOfTheContractExceptInCasesWhereIt')}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article18CompensationForDamages')}
          </Text>
          <Text style={styles.p}>
            {t('settings.ifTheCompanyCausesDamageToAMemberDueTo')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.ifTheMemberSuffersDamageBecauseTheInformationProvidedBy',
            )}
          </Text>
          <Text style={styles.p}>
            {t('settings.ifAMemberCausesDamageToTheCompanyOrA')}
          </Text>
          <Text style={styles.p}>
            {t('settings.ifDamageOccursDueToAnotherMemberSFaultThe')}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article19ProtectionOfPersonalInformationOfMembers')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyStrivesToProtectMembersPersonalInformationAndFollows',
            )}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article20ConsentToProvisionAndUseOfCreditInformation')}
          </Text>
          <Text style={styles.p}>
            {t('settings.whenTheCompanyWishesToProvideAndUseAMember')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.ifTheMemberConsentsTheCompanyMayProvideTheInformation',
            )}
          </Text>

          <Text style={styles.h3}>
            {t('settings.article21ResolutionOfDisputes')}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.theCompanyAndMembersStriveToAmicablyResolveDisputesRelated',
            )}
          </Text>
          <Text style={styles.p}>
            {t(
              'settings.litigationRegardingThisDisputeShallBeBroughtToTheCourt',
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20},
  menuContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  h2: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  h3: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_800,
    marginTop: 12,
    marginBottom: 6,
  },
  p: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginBottom: 6,
  },
  li: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginLeft: 12,
    marginBottom: 4,
  },
});

export default Terms;
