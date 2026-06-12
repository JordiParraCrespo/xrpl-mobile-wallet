import { AvatarTile } from '@flama/design-system-mobile/avatar-tile';
import { Text } from '@flama/design-system-mobile/text';
import type { PaymentPerson } from '@flama/frontend/react';
import { ScrollView, View } from 'react-native';

type PeopleRailProps = {
  people: PaymentPerson[];
  onNewRecipient: () => void;
  onOpenPerson: (person: PaymentPerson) => void;
};

/**
 * The horizontally-scrolling "People" rail: a leading "New" tile to add a
 * recipient, then everyone from the merged feed (saved contacts first, then
 * recent counterparties).
 */
export function PeopleRail({ people, onNewRecipient, onOpenPerson }: PeopleRailProps) {
  return (
    <View>
      <Text className="px-5 pb-3" variant="h4">
        People
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-5"
      >
        <AvatarTile add label="New" onPress={onNewRecipient} />
        {people.map((person) => (
          <AvatarTile key={person.key} name={person.name} onPress={() => onOpenPerson(person)} />
        ))}
      </ScrollView>
    </View>
  );
}
